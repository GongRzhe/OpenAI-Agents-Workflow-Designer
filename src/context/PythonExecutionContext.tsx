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
  // State management
  const [executionResults, setExecutionResults] = useState<Record<string, ExecutionResult>>({});
  const [isPythonBridgeAvailable, setIsPythonBridgeAvailable] = useState<boolean>(false);
  const [checkingBridgeStatus, setCheckingBridgeStatus] = useState<boolean>(false);
  
  // Reference to prevent duplicate status checks
  const pendingStatusChecks = useRef<Record<string, boolean>>({});
  const [canceledExecutions, setCanceledExecutions] = useState<Set<string>>(new Set());

  // Check Python bridge status on component mount
  useEffect(() => {
    // Initial check
    refreshBridgeStatus();

    // Check every 30 seconds
    const intervalId = setInterval(() => {
      refreshBridgeStatus();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const refreshBridgeStatus = useCallback(async () => {
    if (checkingBridgeStatus) return; // Prevent concurrent checks
    
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
  }, [checkingBridgeStatus]);

  // Execute Python code and return execution ID
  const executeCode = useCallback(async (code: string): Promise<string> => {
    if (!isPythonBridgeAvailable) {
      throw new Error('Python bridge is not available. Please check your connection.');
    }

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
        const response = await executeCodeAsync(code);
        const executionId = response.execution_id;

        if (!executionId) {
          throw new Error('No execution ID returned from async execution');
        }

        return executionId;
      }
    } catch (error) {
      console.error('Error executing Python code:', error);
      throw error instanceof Error ? error : new Error('Unknown error executing code');
    }
  }, [isPythonBridgeAvailable]);

  // Stop a running execution (client-side only since API doesn't support stopping)
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
    
    // Clear any pending status checks
    pendingStatusChecks.current[executionId] = false;
  }, []);

  // Map API execution status to our local status
  const mapExecutionStatus = useCallback((apiStatus: BridgeExecutionStatus): ExecutionStatus => {
    switch (apiStatus) {
      case 'running': return 'running';
      case 'completed': return 'completed';
      case 'error': return 'error';
      case 'unknown':
      default: return 'idle';
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

    // If marked as canceled, return error
    if (canceledExecutions.has(executionId)) {
      return 'error';
    }

    // Skip if there's already a pending check for this execution
    if (pendingStatusChecks.current[executionId]) {
      // Return last known status or running as default
      const lastResult = executionResults[executionId];
      if (lastResult) {
        return lastResult.success ? 'completed' : 'error';
      }
      return 'running';
    }

    // Mark as pending
    pendingStatusChecks.current[executionId] = true;

    try {
      // Use the bridge function but convert the result
      const apiStatus = await getBridgeExecutionStatus(executionId);
      const status = mapExecutionStatus(apiStatus);
      
      // If completed or error, fetch the result if we don't have it yet
      if ((status === 'completed' || status === 'error') && !executionResults[executionId]) {
        try {
          const result = await getExecutionResult(executionId);
          
          // Store the result
          setExecutionResults(prev => ({
            ...prev,
            [executionId]: result
          }));
        } catch (error) {
          console.error('Error fetching execution result:', error);
          // Don't override status - it's still complete/error even if we can't get the result
        }
      }

      // Clear pending flag
      pendingStatusChecks.current[executionId] = false;
      
      return status;
    } catch (error) {
      console.error('Error getting execution status:', error);
      
      // Clear pending flag
      pendingStatusChecks.current[executionId] = false;
      
      return 'error';
    }
  }, [executionResults, canceledExecutions, mapExecutionStatus]);

  // Get execution result
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
      // Fetch the result from the bridge
      const result = await getExecutionResult(executionId);
      
      // Store the result
      setExecutionResults(prev => ({
        ...prev,
        [executionId]: result
      }));

      return result;
    } catch (error) {
      console.error('Error getting execution result:', error);
      
      // More specific error handling for different error types
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isStillRunning = errorMessage.includes('202') || 
                              errorMessage.includes('in progress');
      
      const errorResult: ExecutionResult = {
        success: false,
        output: isStillRunning ? 'Execution in progress...' : '',
        error: isStillRunning 
                ? 'Execution still running. Please wait.' 
                : `Failed to fetch result: ${errorMessage}`,
        execution_time: 0
      };

      // Only store error results for permanent errors
      if (!isStillRunning) {
        setExecutionResults(prev => ({
          ...prev,
          [executionId]: errorResult
        }));
      }

      return errorResult;
    }
  }, [executionResults, canceledExecutions]);

  // Context value
  const contextValue = {
    executeCode,
    stopExecution,
    getExecutionStatus,
    getResult,
    executionResults,
    isPythonBridgeAvailable,
    checkingBridgeStatus,
    refreshBridgeStatus
  };

  return (
    <PythonExecutionContext.Provider value={contextValue}>
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