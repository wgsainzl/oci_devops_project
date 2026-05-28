package com.springboot.MyTodoList.web.features.task.dto;

import com.springboot.MyTodoList.web.features.task.Task;
import com.springboot.MyTodoList.web.features.task.TaskStatus;
import com.springboot.MyTodoList.web.features.task.TaskPriority;
import java.time.OffsetDateTime;

public record TaskDTO(
    Integer id,                  // Strongly typed Integer
    String title,
    String description,
    TaskStatus status,           // Strongly typed Enum
    TaskPriority priority,       // Strongly typed Enum
    OffsetDateTime createdAt,    // Strongly typed Date
    OffsetDateTime dueDate,      // Strongly typed Date
    OffsetDateTime startDate,    // Strongly typed Date
    String responsible,          // User's name as String
    Long responsibleId,          // Strongly typed Long (Matches User.userId)
    Double estimatedHours, 
    Double actualHours,    
    SprintReference sprint       // Strongly typed Record
) {

    // A clean, strict definition for the nested JSON object
    public record SprintReference(Integer sprintId, String sprintName) {}

    public static TaskDTO fromEntity(Task task) {
        
        SprintReference sprintRef = null;
        if (task.getSprint() != null) {
            sprintRef = new SprintReference(
                task.getSprint().getSprintId(),
                task.getSprint().getSprintName()
            );
        }

        return new TaskDTO(
            task.getTaskId(), 
            task.getTitle(),
            task.getDescription(),
            task.getStatus(),
            task.getPriority(),
            task.getCreatedAt(),
            task.getDueDate(),
            task.getStartDate(),
            task.getResponsible() != null ? task.getResponsible().getName() : null,
            task.getResponsible() != null ? task.getResponsible().getUserId() : null,
            task.getEstimatedHours(),
            task.getActualHours(),
            sprintRef 
        );
    }
}