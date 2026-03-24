package com.springboot.MyTodoList.exception;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message
) {
    public static ApiErrorResponse of(HttpStatus status, String error, String message) {
        return new ApiErrorResponse(LocalDateTime.now(), status.value(), error, message);
    }
}

