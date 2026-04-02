package com.cupl.backend.config;

import com.cupl.backend.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        String errorCode = ex.getReason();
        String message = ex.getReason();
        
        // Check if the reason is an error code
        if (ErrorResponse.EMAIL_ALREADY_EXISTS.equals(errorCode)) {
            message = "This email is already registered. Try signing in instead.";
        } else if (ErrorResponse.INVALID_CREDENTIALS.equals(errorCode)) {
            message = "Invalid email or password.";
        } else {
            // Use the exception message if available
            message = ex.getMessage() != null ? ex.getMessage() : errorCode;
        }
        
        ErrorResponse errorResponse = new ErrorResponse(errorCode, message);
        return ResponseEntity.status(ex.getStatusCode()).body(errorResponse);
    }
}
