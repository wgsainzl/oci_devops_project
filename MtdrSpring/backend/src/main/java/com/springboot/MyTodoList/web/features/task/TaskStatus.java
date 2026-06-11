package com.springboot.MyTodoList.web.features.task;

public enum TaskStatus {
    TODO, IN_PROGRESS, BLOCKED, IN_REVIEW, DONE;
    public static TaskStatus fromString(String text) {
        if (text == null || text.isBlank()) {
            return TODO;
        }
        String normalizedText = text.trim().toUpperCase().replace(" ", "_");
        for (TaskStatus status : TaskStatus.values()) {
            if (status.name().equals(normalizedText)) {
                return status;
            }
        }
        return TODO;
    }
    
}
