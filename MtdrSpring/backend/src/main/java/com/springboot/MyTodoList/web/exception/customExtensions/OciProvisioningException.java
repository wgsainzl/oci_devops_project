package com.springboot.MyTodoList.web.exception.customExtensions;

public class OciProvisioningException extends RuntimeException {
    public OciProvisioningException(String message) { super(message); }
}
