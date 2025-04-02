// src/utils/pythonBridge.ts
// API bridge for communicating with the Python backend

// Type definitions
export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    execution_time: number;
    execution_id?: string;
}

export type ExecutionStatus = 'running' | 'completed' | 'error' | 'unknown';

// API Configuration
const API_BASE_URL = 'http://localhost:8888'; // Update this to match your Python API server

// Helper function to handle API errors
const handleApiError = (error: any, defaultMessage: string): never => {
    console.error(`API Error: ${defaultMessage}`, error);
    throw new Error(error?.message || defaultMessage);
};

/**
 * Execute Python code synchronously
 */
export const executePythonCode = async (code: string, timeout: number = 30): Promise<ExecutionResult> => {
    try {
        console.log("Executing code:", code.substring(0, 100) + "..."); // Log just the beginning
        
        // Add a timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
        
        const response = await fetch(`${API_BASE_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                timeout,
                async_execution: false // Explicitly set to synchronous
            }),
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        // Proper type checking before accessing error.name
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
            return {
                success: false,
                output: '',
                error: 'Request timed out. The server may be overloaded or unresponsive.',
                execution_time: timeout,
            };
        }
        
        return {
            success: false,
            output: '',
            error: error instanceof Error ? error.message : 'Unknown error executing Python code',
            execution_time: 0,
        };
    }
};

/**
 * Execute Python code asynchronously
 */
export const executeCodeAsync = async (code: string, timeout: number = 30): Promise<ExecutionResult> => {
    try {
        const response = await fetch(`${API_BASE_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                timeout,
                async_execution: true // Set to asynchronous execution
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to execute code asynchronously:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to execute code asynchronously');
    }
};

/**
 * Get the status of an asynchronous execution
 */
export const getExecutionStatus = async (executionId: string): Promise<ExecutionStatus> => {
    try {
        const response = await fetch(`${API_BASE_URL}/status/${executionId}`);

        if (!response.ok) {
            if (response.status === 404) {
                return 'unknown'; // Execution not found
            }
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return data.status as ExecutionStatus;
    } catch (error) {
        console.error('Error checking execution status:', error);
        return 'error';
    }
};

/**
 * Get the result of an execution
 */
export const getExecutionResult = async (executionId: string): Promise<ExecutionResult> => {
    try {
        const response = await fetch(`${API_BASE_URL}/result/${executionId}`);

        if (!response.ok) {
            if (response.status === 202) {
                // Still in progress
                return {
                    success: false,
                    output: 'Execution still in progress...',
                    error: 'Execution not completed yet',
                    execution_time: 0,
                };
            }

            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        return {
            success: false,
            output: '',
            error: error instanceof Error ? error.message : 'Unknown error fetching execution result',
            execution_time: 0,
        };
    }
};

/**
 * Check if the Python bridge is available
 */
export const checkPythonBridgeStatus = async (): Promise<boolean> => {
    try {
        // Create a controller for timeout instead of using AbortSignal.timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${API_BASE_URL}/status`, {
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.error('Python bridge is not available:', error);
        return false;
    }
};