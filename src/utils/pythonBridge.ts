// src/utils/pythonBridge.ts
// API bridge for communicating with the Python backend

// Type definitions
export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    execution_time: number;
}

export interface AsyncExecutionResponse {
    execution_id: string;
}

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'error';

// API Configuration
const API_BASE_URL = 'http://localhost:8088'; // Update this to match your Python API server

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
        const response = await fetch(`${API_BASE_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                timeout,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
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
 * Execute Python code asynchronously
 */
export const executeCodeAsync = async (code: string, timeout: number = 30): Promise<AsyncExecutionResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/execute/async`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                timeout,
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
                return 'idle'; // Execution not found, consider it idle
            }
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return data.status;
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
 * Stop a running execution
 */
export const stopExecution = async (executionId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/stop/${executionId}`, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error stopping execution:', error);
        return false;
    }
};

/**
 * Get a list of installed Python packages
 */
export const getInstalledPackages = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dependencies`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return data.dependencies;
    } catch (error) {
        console.error('Failed to fetch installed packages:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch installed packages');
    }
};

/**
 * Install a Python package
 */
export const installPackage = async (packageName: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dependencies/install`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                package: packageName,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error installing package:', error);
        return false;
    }
};

/**
 * Check if the Python bridge is available
 */
export const checkPythonBridgeStatus = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/status`, {
            // Set a timeout to prevent hanging
            signal: AbortSignal.timeout(2000),
        });

        return response.ok;
    } catch (error) {
        console.error('Python bridge is not available:', error);
        return false;
    }
};

/**
 * Get example OpenAI Agent code templates
 */
export const getAgentExamples = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/openai-agents/examples`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return data.examples;
    } catch (error) {
        console.error('Error fetching agent examples:', error);
        return [];
    }
};