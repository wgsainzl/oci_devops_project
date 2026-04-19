package com.springboot.MyTodoList.features.task;


import jakarta.persistence.*;

import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


/*
    representation of the TODOITEM table that exists already
    in the autonomous database
 */
@Entity
@Table(name = "Tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Integer taskId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "Text")
    private String description;

    @Column(name = "start_date")
    private OffsetDateTime startDate;

    @Column(name = "due_date")
    private OffsetDateTime dueDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "estimated_hours")
    private Double estimatedHours;

    @Column(name = "actual_hours")
    private Double actualHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TaskStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private com.springboot.MyTodoList.web.features.user.User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_id")
    private com.springboot.MyTodoList.web.features.user.User responsible;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private com.springboot.MyTodoList.web.features.user.User manager;

    // Getters and Setters for the new fields
    public com.springboot.MyTodoList.web.features.user.User getCreator() { return creator; }
    public void setCreator(com.springboot.MyTodoList.web.features.user.User creator) { this.creator = creator; }
    
    public com.springboot.MyTodoList.web.features.user.User getResponsible() { return responsible; }
    public void setResponsible(com.springboot.MyTodoList.web.features.user.User responsible) { this.responsible = responsible; }
    
    public com.springboot.MyTodoList.web.features.user.User getManager() { return manager; }
    public void setManager(com.springboot.MyTodoList.web.features.user.User manager) { this.manager = manager; }
    // --- RELATIONSHIPS ---
    @JsonIgnore
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<com.springboot.MyTodoList.features.tasklog.TaskLog> logs;
    
    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "dependencies",
        joinColumns = @JoinColumn(name = "parent_task_id"),
        inverseJoinColumns = @JoinColumn(name = "child_task_id")
    )
    private java.util.Set<Task> dependentTasks;
    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private TaskPriority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id")
    private com.springboot.MyTodoList.features.sprint.Sprint sprint;

    public Task(){

    }
    public Task(String title, String description, OffsetDateTime startDate, OffsetDateTime dueDate, 
                Double estimatedHours, TaskStatus status, TaskPriority priority) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.estimatedHours = estimatedHours;
        this.status = status;
        this.priority = priority;
    }

    // --- getters & setterws---

    public Integer getTaskId() {
        return taskId;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public OffsetDateTime getStartDate() {
        return startDate;
    }
    public void setStartDate(OffsetDateTime startDate) {
        this.startDate = startDate;
    }

    public OffsetDateTime getDueDate() {
        return dueDate;
    }
    public void setDueDate(OffsetDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }
    public void setCompletedAt(OffsetDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Double getEstimatedHours() {
        return estimatedHours;
    }
    public void setEstimatedHours(Double estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public Double getActualHours() {
        return actualHours;
    }
    public void setActualHours(Double actualHours) {
        this.actualHours = actualHours;
    }

    public TaskStatus getStatus() {
        return status;
    }
    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }
    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public com.springboot.MyTodoList.features.sprint.Sprint getSprint() {
        return sprint;
    }
    public void setSprint(com.springboot.MyTodoList.features.sprint.Sprint sprint) {
        this.sprint = sprint;
    }
}
