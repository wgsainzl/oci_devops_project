package com.springboot.MyTodoList.web.exception.customExtensions;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) { super(message); }
}
