// src/context/PythonExecutionContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  executePythonCode,
  executeCodeAsync,
  getExecutionStatus,
  getExecutionResult,
  stopExecution as stopExecutionApi,
  checkPythonBridgeStatus
} from '../utils/pythonBridge';

// Define types
export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'error';

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  execution_time: number;
}

interface PythonExecutionContextType {
  executeCode: (code: string) => Promise<string>; // Returns execution ID
  stopExecution: (executionId: string) => Promise<void>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionStatus>;
  getResult: (executionId: string) => Promise<ExecutionResult>;
  executionResults: Record<string, ExecutionResult>;
  isPythonBridgeAvailable: boolean;
  checkingBridgeStatus: boolean;
  refreshBridgeStatus: () => Promise<void>;
}

const PythonExecutionContext = createContext<PythonExecutionContextType | undefined>(undefined);

export const PythonExecutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [executionResults, setExecutionResults] = useState<Record<string, ExecutionResult>>({});
  const [isPythonBridgeAvailable, setIsPythonBridgeAvailable] = useState<boolean>(false);
  const [checkingBridgeStatus, setCheckingBridgeStatus] = useState<boolean>(false);
  // Add this ref to track retry attempts for each execution
  const executionRetries = useRef<Record<string, number>>({});

  const [pendingExecutions, setPendingExecutions] = useState<Record<string, number>>({});
  const [pollAttemptsMap, setPollAttemptsMap] = useState<Record<string, number>>({});

  // Check Python bridge status on component mount
  useEffect(() => {
    refreshBridgeStatus();
    
    // Check every 30 seconds
    const intervalId = setInterval(refreshBridgeStatus, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const refreshBridgeStatus = useCallback(async () => {
    setCheckingBridgeStatus(true);
    try {
      const status = await checkPythonBridgeStatus();
      setIsPythonBridgeAvailable(status);
    } catch (error) {
      console.error('Error checking Python bridge status:', error);
      setIsPythonBridgeAvailable(false);
    } finally {
      setCheckingBridgeStatus(false);
    }
  }, []);

  // Execute Python code and return execution ID
  const executeCode = useCallback(async (code: string): Promise<string> => {
    try {
      // For small code snippets, execute synchronously
      if (code.split('\n').length < 10 && !code.includes('asyncio')) {
        const result = await executePythonCode(code);
        // Generate a pseudo execution ID
        const executionId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store the result
        setExecutionResults(prev => ({
          ...prev,
          [executionId]: result
        }));
        
        return executionId;
      } else {
        // For larger code or code with asyncio, execute asynchronously
        const { execution_id } = await executeCodeAsync(code);
        
        // Reset retry counter for this execution
        executionRetries.current[execution_id] = 0;
        
        return execution_id;
      }
    } catch (error) {
      console.error('Error executing Python code:', error);
      throw error;
    }
  }, []);

  // Stop a running execution
  const stopExecution = useCallback(async (executionId: string): Promise<void> => {
    try {
      // Only call the API for async executions
      if (!executionId.startsWith('sync-')) {
        await stopExecutionApi(executionId);
      }
      
      // Remove from retry counter
      if (executionRetries.current[executionId]) {
        delete executionRetries.current[executionId];
      }
    } catch (error) {
      console.error('Error stopping execution:', error);
    }
  }, []);

  // Get current execution status
  const getExecutionStatus = useCallback(async (executionId: string): Promise<ExecutionStatus> => {
    // For sync executions, check the local state
    if (executionId.startsWith('sync-')) {
      return executionResults[executionId] ? 
        (executionResults[executionId].success ? 'completed' : 'error') : 
        'running';
    }
    
    // Prevent excessive polling for the same execution ID
    const pendingCount = pendingExecutions[executionId] || 0;
    if (pendingCount > 5) {
      // Too many pending requests for this execution, return error
      const errorResult: ExecutionResult = {
        success: false,
        output: '',
        error: 'Execution timed out or server is not responding properly',
        execution_time: 0
      };
      
      setExecutionResults(prev => ({
        ...prev,
        [executionId]: errorResult
      }));
      
      // Clear pending count
      setPendingExecutions(prev => {
        const updated = {...prev};
        delete updated[executionId];
        return updated;
      });
      
      return 'error';
    }
    
    // Track that we're checking this execution
    setPendingExecutions(prev => ({
      ...prev,
      [executionId]: pendingCount + 1
    }));
    
    try {
      const status = await getExecutionStatus(executionId);
      
      // If completed or error, fetch the result
      if (status === 'completed' || status === 'error') {
        const result = await getExecutionResult(executionId);
        
        // Store the result
        setExecutionResults(prev => ({
          ...prev,
          [executionId]: result
        }));
        
        // Clear pending count
        setPendingExecutions(prev => {
          const updated = {...prev};
          delete updated[executionId];
          return updated;
        });
      }
      
      return status;
    } catch (error) {
      console.error('Error getting execution status:', error);
      
      // Clear pending count on error
      setPendingExecutions(prev => {
        const updated = {...prev};
        delete updated[executionId];
        return updated;
      });
      
      return 'error';
    }
  }, [executionResults, pendingExecutions]);

  // Get execution result
  const getResult = useCallback(async (executionId: string): Promise<ExecutionResult> => {
    // Check if we already have the result
    if (executionResults[executionId]) {
      return executionResults[executionId];
    }
    
    // For sync executions that somehow don't have a result
    if (executionId.startsWith('sync-')) {
      return {
        success: false,
        output: '',
        error: 'Execution result not found',
        execution_time: 0
      };
    }
    // Track polling attempts
    const currentAttempts = pollAttemptsMap[executionId] || 0;
    if (currentAttempts > 10) { // Limit to 10 attempts
        const errorResult: ExecutionResult = {
            success: false,
            output: '',
            error: 'Execution polling exceeded maximum attempts',
            execution_time: 0
        };
        
        setExecutionResults(prev => ({
            ...prev,
            [executionId]: errorResult
        }));
        
        return errorResult;
    }
    
    // Update attempt counter
    setPollAttemptsMap(prev => ({
        ...prev,
        [executionId]: currentAttempts + 1
    }));
    
    try {
      const result = await getExecutionResult(executionId);
      
      // Store the result
      setExecutionResults(prev => ({
        ...prev,
        [executionId]: result
      }));
      
      // // Clear retry counter
      // if (executionRetries.current[executionId]) {
      //   delete executionRetries.current[executionId];
      // }
      // Reset polling attempts on success
      setPollAttemptsMap(prev => {
        const updated = {...prev};
        delete updated[executionId];
        return updated;
    });
      
      return result;
    } catch (error) {
      console.error('Error getting execution result:', error);
      
      // Add retry handling for 202 responses
      if (error && String(error).includes('202')) {
        const currentRetries = executionRetries.current[executionId] || 0;
        executionRetries.current[executionId] = currentRetries + 1;
        
        // If we've tried too many times, return an error
        if (currentRetries >= 5) {
          const errorResult: ExecutionResult = {
            success: false,
            output: '',
            error: 'Execution timed out or server is not responding properly',
            execution_time: 0
          };
          
          // Store the error result
          setExecutionResults(prev => ({
            ...prev,
            [executionId]: errorResult
          }));
          
          // Clear retry counter
          delete executionRetries.current[executionId];
          
          return errorResult;
        }
        
        // If we haven't reached max retries, return a pending result
        return {
          success: false,
          output: 'Execution in progress...',
          error: 'Execution still running. Please wait.',
          execution_time: 0
        };
      }
      
      const errorResult: ExecutionResult = {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        execution_time: 0
      };
      
      // Store the error result
      setExecutionResults(prev => ({
        ...prev,
        [executionId]: errorResult
      }));
      
      return errorResult;
    }
  }, [executionResults]);

  return (
    <PythonExecutionContext.Provider
      value={{
        executeCode,
        stopExecution,
        getExecutionStatus,
        getResult,
        executionResults,
        isPythonBridgeAvailable,
        checkingBridgeStatus,
        refreshBridgeStatus
      }}
    >
      {children}
    </PythonExecutionContext.Provider>
  );
};

export const usePythonExecution = (): PythonExecutionContextType => {
  const context = useContext(PythonExecutionContext);
  if (context === undefined) {
    throw new Error('usePythonExecution must be used within a PythonExecutionProvider');
  }
  return context;
};