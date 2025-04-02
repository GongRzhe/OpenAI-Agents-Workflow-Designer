// src/utils/pythonBridge.ts
// API bridge for communicating with the Python backend

// Import environment variables
// NOTE: Add .env file to the project root with API_URL variable
// Or update this to read from a config.ts file
// const API_BASE_URL = process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:8888';
const API_BASE_URL = 'http://localhost:8888';
// Type definitions
export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    execution_time: number;
    execution_id?: string;
}

export type ExecutionStatus = 'running' | 'completed' | 'error' | 'unknown';

// Centralized error handling
const handleApiError = (error: unknown, defaultMessage: string): Error => {
    console.error(`API Error: ${defaultMessage}`, error);

    if (error instanceof Error) {
        return error;
    }

    if (error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string') {
        return new Error(error.message);
    }

    return new Error(defaultMessage);
};

/**
 * Execute Python code synchronously
 */
export const executePythonCode = async (code: string, timeout: number = 30): Promise<ExecutionResult> => {
    try {
        // Only log first 50 chars for security and cleanliness
        console.log("Executing code:", code.substring(0, 50) + "...");

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
                async_execution: false
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
        // Handle AbortError (timeout) specially
        if (error && typeof error === 'object' && 'name' in error &&
            error.name === 'AbortError') {
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
        console.log("Executing async code:", code.substring(0, 50) + "...");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for initial request

        const response = await fetch(`${API_BASE_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                timeout,
                async_execution: true
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
        // Handle AbortError specially
        if (error && typeof error === 'object' && 'name' in error &&
            error.name === 'AbortError') {
            throw new Error('Request to execute code timed out. The server may be overloaded.');
        }

        throw handleApiError(error, 'Failed to execute code asynchronously');
    }
};

/**
 * Get the status of an asynchronous execution
 */
export const getExecutionStatus = async (executionId: string): Promise<ExecutionStatus> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(`${API_BASE_URL}/status/${executionId}`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

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
        // Handle AbortError specially
        if (error && typeof error === 'object' && 'name' in error &&
            error.name === 'AbortError') {
            console.error('Timeout checking execution status');
            return 'unknown';
        }

        console.error('Error checking execution status:', error);
        return 'error';
    }
};

/**
 * Get the result of an execution
 */
export const getExecutionResult = async (executionId: string): Promise<ExecutionResult> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(`${API_BASE_URL}/result/${executionId}`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

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

        // Parse JSON once and store the result
        const result = await response.json();
        return result;
    } catch (error) {
        // Handle AbortError specially
        if (error && typeof error === 'object' && 'name' in error &&
            error.name === 'AbortError') {
            return {
                success: false,
                output: '',
                error: 'Request timed out when fetching execution result',
                execution_time: 0,
            };
        }

        return {
            success: false,
            output: '',
            error: error instanceof Error ? error.message : 'Unknown error fetching execution result',
            execution_time: 0,
        };
    }
};

/**
 * Execute code and poll for the result
 */
export const executePythonCodeAndWaitForResult = async (code: string, timeout: number = 30): Promise<ExecutionResult> => {
    try {
        // Start async execution
        const execResponse = await executeCodeAsync(code, timeout);
        const executionId = execResponse.execution_id;

        if (!executionId) {
            return {
                success: false,
                output: '',
                error: 'No execution ID received',
                execution_time: 0,
            };
        }

        // Return immediately, let caller decide how to poll
        return {
            ...execResponse,
            success: true,
            output: 'Execution started successfully',
            execution_id: executionId
        };
    } catch (error) {
        return {
            success: false,
            output: '',
            error: error instanceof Error ? error.message : 'Unknown error executing Python code',
            execution_time: 0,
        };
    }
};

/**
 * Check if the Python bridge is available
 */
export const checkPythonBridgeStatus = async (): Promise<boolean> => {
    try {
        // Create a controller for timeout
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