// Error codes from backend
export enum ErrorCode {
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// Error response structure from backend
export interface ErrorResponse {
  errorCode: ErrorCode | string;
  message: string;
}

// Helper to parse error response
export async function parseErrorResponse(response: Response): Promise<ErrorResponse | null> {
  try {
    const text = await response.text();
    if (!text) return null;
    
    try {
      return JSON.parse(text) as ErrorResponse;
    } catch {
      // Not JSON, return as message
      return {
        errorCode: '',
        message: text,
      };
    }
  } catch {
    return null;
  }
}

// Helper to check if error is a specific code
export function isErrorCode(error: ErrorResponse | null, code: ErrorCode): boolean {
  return error?.errorCode === code;
}
