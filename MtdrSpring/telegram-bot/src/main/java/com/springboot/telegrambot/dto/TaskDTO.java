package com.springboot.telegrambot.dto;

import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true) 
public class TaskDTO {
    
    // Maps the backend's "id" JSON key to this class's "taskId" variable
    @JsonProperty("id")
    private Integer taskId; 
    
    private String title;
    private String description;
    
    private OffsetDateTime startDate;
    private OffsetDateTime dueDate;
    private OffsetDateTime createdAt;
    
    private Double estimatedHours;
    private Double actualHours;
    private TaskStatus status; 
    private String priority; 
    
    private String responsible;
    private Long responsibleId;
    
    private SprintReference sprint;

    // --- Default Constructor ---
    public TaskDTO() {}

    // --- Getters and Setters ---
    public Integer getTaskId() { return taskId; }
    public void setTaskId(Integer taskId) { this.taskId = taskId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public OffsetDateTime getStartDate() { return startDate; }
    public void setStartDate(OffsetDateTime startDate) { this.startDate = startDate; }

    public OffsetDateTime getDueDate() { return dueDate; }
    public void setDueDate(OffsetDateTime dueDate) { this.dueDate = dueDate; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public Double getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Double estimatedHours) { this.estimatedHours = estimatedHours; }

    public Double getActualHours() { return actualHours; }
    public void setActualHours(Double actualHours) { this.actualHours = actualHours; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getResponsible() { return responsible; }
    public void setResponsible(String responsible) { this.responsible = responsible; }

    public Long getResponsibleId() { return responsibleId; }
    public void setResponsibleId(Long responsibleId) { this.responsibleId = responsibleId; }
    
    public SprintReference getSprint() { return sprint; }
    public void setSprint(SprintReference sprint) { this.sprint = sprint; }

    // --- Nested Class for Sprint ---
    @JsonIgnoreProperties(ignoreUnknown = true) 
    public static class SprintReference {
        private Integer sprintId;
        private String sprintName;
        
        public SprintReference() {}
        
        public Integer getSprintId() { return sprintId; }
        public void setSprintId(Integer sprintId) { this.sprintId = sprintId; }
        
        public String getSprintName() { return sprintName; }
        public void setSprintName(String sprintName) { this.sprintName = sprintName; }
    }
}
    // NEW: Nested class to map the "responsible" JSON object

    /*
    public static class UserReference {
        private Integer userId;
        private String name;
        private String email;
        
        // 1. Default constructor (Jackson uses this when it receives a full JSON object)
        public UserReference() {}
        
        // 2. Fallback String constructor (Jackson uses this when it receives just a string)
        public UserReference(String name) {
            this.name = name;
        }
        
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class SprintReference {
        @JsonProperty("sprintId")
        private Integer sprintId;
        
        public Integer getSprintId() { return sprintId; }
        public void setSprintId(Integer sprintId) { this.sprintId = sprintId; }
    }
}
    */