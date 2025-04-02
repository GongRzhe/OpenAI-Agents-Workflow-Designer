// src/context/PythonExecutionContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  executePythonCode,
  executeCodeAsync,
  getExecutionStatus as getBridgeExecutionStatus,
  getExecutionResult,
  checkPythonBridgeStatus,
  ExecutionStatus as BridgeExecutionStatus,
  executePythonCodeAndWaitForResult
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
  stopExecution: (executionId: string) => Promise<void>; // Now handled locally
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

  // Track canceled executions (since API no longer has stopExecution)
  const [canceledExecutions, setCanceledExecutions] = useState<Set<string>>(new Set());

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
        const result = await executePythonCodeAndWaitForResult(code);
        const executionId = result.execution_id;

        if (!executionId) {
          throw new Error('No execution ID returned from async execution');
        }

        // Reset retry counter for this execution
        executionRetries.current[executionId] = 0;

        return executionId;
      }
    } catch (error) {
      console.error('Error executing Python code:', error);
      throw error;
    }
  }, []);

  // Stop a running execution (now handled locally since API endpoint was removed)
  const stopExecution = useCallback(async (executionId: string): Promise<void> => {
    // For sync executions, nothing to do
    if (executionId.startsWith('sync-')) {
      return;
    }

    // Mark as canceled locally
    setCanceledExecutions(prev => {
      const updated = new Set(prev);
      updated.add(executionId);
      return updated;
    });

    // Remove from retry counter
    if (executionRetries.current[executionId]) {
      delete executionRetries.current[executionId];
    }

    // Add a canceled result
    setExecutionResults(prev => ({
      ...prev,
      [executionId]: {
        success: false,
        output: 'Execution canceled by user',
        error: 'Execution canceled',
        execution_time: 0
      }
    }));
  }, []);

  // Map API execution status to our local status
  const mapExecutionStatus = (apiStatus: BridgeExecutionStatus): ExecutionStatus => {
    switch (apiStatus) {
      case 'running': return 'running';
      case 'completed': return 'completed';
      case 'error': return 'error';
      case 'unknown':
      default: return 'idle';
    }
  };

  // Get current execution status
  // Get current execution status
  const getExecutionStatus = useCallback(async (executionId: string): Promise<ExecutionStatus> => {
    // For sync executions, check the local state
    if (executionId.startsWith('sync-')) {
      return executionResults[executionId] ?
        (executionResults[executionId].success ? 'completed' : 'error') :
        'running';
    }

    // If marked as canceled, return error
    if (canceledExecutions.has(executionId)) {
      return 'error';
    }

    // Prevent excessive polling for the same execution ID
    const pendingCount = pendingExecutions[executionId] || 0;
  if (pendingCount > 10) {
    // Too many pending requests for this execution
    setExecutionResults(prev => ({
      ...prev,
      [executionId]: {
        success: false,
        output: '',
        error: 'Execution timed out or server is not responding properly',
        execution_time: 0
      }
    }));
    
    // Clear pending count
    setPendingExecutions(prev => {
      const updated = { ...prev };
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
      // Use the bridge function but convert the result
      const bridgeStatus = await getBridgeExecutionStatus(executionId);

      // Map the bridge status to our local status type
      const status: ExecutionStatus =
        bridgeStatus === 'running' ? 'running' :
          bridgeStatus === 'completed' ? 'completed' :
            bridgeStatus === 'error' ? 'error' : 'idle';

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
          const updated = { ...prev };
          delete updated[executionId];
          return updated;
        });
      }

      return status;
    } catch (error) {
      console.error('Error getting execution status:', error);

      // Clear pending count on error
      setPendingExecutions(prev => {
        const updated = { ...prev };
        delete updated[executionId];
        return updated;
      });

      return 'error';
    }
  }, [executionResults, pendingExecutions, canceledExecutions]);

  // Get execution result
  // In PythonExecutionContext.tsx, modify the getResult function:

const getResult = useCallback(async (executionId: string): Promise<ExecutionResult> => {
  // Check if we already have the result
  if (executionResults[executionId]) {
    return executionResults[executionId];
  }

  // If marked as canceled, return canceled result
  if (canceledExecutions.has(executionId)) {
    return {
      success: false,
      output: 'Execution canceled by user',
      error: 'Execution canceled',
      execution_time: 0
    };
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

  try {
    // Direct call to get the result without tracking polling attempts
    const result = await getExecutionResult(executionId);
    
    // Log the received result for debugging
    console.log('Received result from API:', result);
    
    // Store the result
    setExecutionResults(prev => ({
      ...prev,
      [executionId]: result
    }));

    return result;
  } catch (error) {
    console.error('Error getting execution result:', error);
    
    // More specific error handling for 202 responses
    if (error && String(error).includes('202')) {
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
}, [executionResults, canceledExecutions]);

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