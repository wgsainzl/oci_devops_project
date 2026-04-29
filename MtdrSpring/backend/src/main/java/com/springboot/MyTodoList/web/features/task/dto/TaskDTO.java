package com.springboot.MyTodoList.web.features.task.dto;

import com.springboot.MyTodoList.web.features.task.Task;
import java.util.HashMap;
import java.util.Map;

public record TaskDTO(
    String id,
    String title,
    String description,
    String status,
    String priority,
    String createdAt,
    String dueDate,
    String startDate,
    String responsible,
    String responsibleId,
    Double estimatedHours, // <-- Changed to Double to match Task.java
    Double actualHours,    // <-- Changed to Double to match Task.java
    Map<String, Object> sprint
) {
    public static TaskDTO fromEntity(Task task) {
        
        // Build the nested map safely
        Map<String, Object> sprintMap = null;
        if (task.getSprint() != null) {
            sprintMap = new HashMap<>(); // <-- HashMap is safer as it allows null values
            sprintMap.put("sprintId", task.getSprint().getSprintId());
            sprintMap.put("sprintName", task.getSprint().getSprintName());
        }

        return new TaskDTO(
            String.valueOf(task.getTaskId()), 
            task.getTitle(),
            task.getDescription(),
            task.getStatus() != null ? task.getStatus().name() : null,
            task.getPriority() != null ? task.getPriority().name() : null,
            task.getCreatedAt() != null ? task.getCreatedAt().toString() : null,
            task.getDueDate() != null ? task.getDueDate().toString() : null,
            task.getStartDate() != null ? task.getStartDate().toString() : null,
            task.getResponsible() != null ? task.getResponsible().getName() : null,
            task.getResponsible() != null ? String.valueOf(task.getResponsible().getUserId()) : null,
            task.getEstimatedHours(), // <-- Now perfectly matches the Double type
            task.getActualHours(),    // <-- Now perfectly matches the Double type
            sprintMap 
        );
    }
}