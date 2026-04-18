package com.springboot.MyTodoList.web.exception;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(MissingRequestCookieException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingRequestCookieException(MissingRequestCookieException ex) {
        log.error("Missing request cookie: {}", ex.getMessage());
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "Missing Request Cookie", ex.getMessage()));
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateKeyException(DuplicateKeyException ex) {
        log.error("Duplicate key error: {}", ex.getMessage());
        HttpStatus status = HttpStatus.CONFLICT;

        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "Duplicate Key Error", ex.getMessage()));
    }


    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        log.error("Authentication error: {}", ex.getMessage());

        HttpStatus status = HttpStatus.UNAUTHORIZED;

        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "Authentication Error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException ex) {
        log.error("Illegal state error: {}", ex.getMessage());

        Map<String, Object> response = createErrorResponse(HttpStatus.BAD_REQUEST, "Illegal State Error", ex.getMessage());

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InsufficientAuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleInsufficientAuthenticationException(InsufficientAuthenticationException ex) {
        log.error("Insufficient authentication: {}", ex.getMessage());

        HttpStatus status = HttpStatus.UNAUTHORIZED;

        Map<String, Object> response = createErrorResponse(status, "Insufficient Authentication", ex.getMessage());

        return new ResponseEntity<>(response, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "Server Error", "An unexpected error occurred"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("Illegal argument error: {}", ex.getMessage());

        HttpStatus status = HttpStatus.BAD_REQUEST;


        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "Illegal Argument", ex.getMessage()));
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiErrorResponse> handleLockedException(LockedException ex) {
        log.error("Account locked error: {}", ex.getMessage());

        HttpStatus status = HttpStatus.LOCKED;


        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "Account Locked", ex.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiErrorResponse> handleNoSuchElementException(NoSuchElementException ex) {
        log.error("The element does not exist: {}", ex.getMessage());

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "The element was not found.", ex.getMessage()));
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthorizationDeniedException(AuthorizationDeniedException ex) {
        log.error("Authorization denied error: {}", ex.getMessage());

        HttpStatus status = HttpStatus.FORBIDDEN;

        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "Authorization Denied", ex.getMessage()));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleEntityNotFoundException(EntityNotFoundException ex) {
        log.error("Entity not found: {}", ex.getMessage());

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {

        HttpStatus status = HttpStatus.CONFLICT;

        if (ex.getCause() != null && ex.getCause().getMessage() != null) {
            String causeMessage = ex.getCause().getMessage();
            if (causeMessage.contains("duplicate key value violates unique constraint") || causeMessage.contains("Unique index or primary key violation")) {

                if (causeMessage.contains("name")) {
                    return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "Cannot save record with duplicate name. Please use a unique value.", "Error violating unique constraint."));
                }

                return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "The record you are trying to save already exists (e.g., duplicate name). Please use a unique value.", "Error violating unique constraint."));
            }
        }
        return ResponseEntity.status(status).body(ApiErrorResponse.of(status, "A data integrity violation occurred.", "Error violating unique constraint.")); // 409 Conflict is appropriate for unique constraint violations
    }


    private Map<String, Object> createErrorResponse(HttpStatus status, String error, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        response.put("error", error);
        response.put("message", message);
        return response;
    }
}
