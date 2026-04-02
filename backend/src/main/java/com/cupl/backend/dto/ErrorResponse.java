package com.cupl.backend.dto;

public class ErrorResponse {
    private String errorCode;
    private String message;

    public ErrorResponse() {}

    public ErrorResponse(String errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // Error code constants
    public static final String EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS";
    public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
}
