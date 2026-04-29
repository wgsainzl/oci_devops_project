package com.springboot.telegrambot.dto;

import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

public class TaskDTO {
    @JsonProperty("id")
    private Integer taskId;
    private String title;
    private String description;
    private OffsetDateTime startDate;
    private OffsetDateTime dueDate;
    private Double estimatedHours;
    private Double actualHours;
    private TaskStatus status;
    private String priority;
    private String responsible;
    private String responsibleId;
    
    // Getters and Setters
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

    public String getResponsibleId() { return responsibleId; }
    public void setResponsibleId(String responsibleId) { this.responsibleId = responsibleId; }
}