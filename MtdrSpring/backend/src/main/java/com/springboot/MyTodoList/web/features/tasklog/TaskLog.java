package com.springboot.MyTodoList.web.features.tasklog;

import com.fasterxml.jackson.annotation.JsonIgnore; // 1. ADD THIS IMPORT
import com.springboot.MyTodoList.web.features.task.Task;
import com.springboot.MyTodoList.web.features.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "task_logs")
public class TaskLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Integer id;

    // Many logs belong to one Task
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    // Many logs belong to one User (the user who made the change)
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "field_name")
    private String fieldName; // e.g., "status", "responsible_id"

    @Column(name = "old_value")
    private String oldValue; // e.g., "TODO"

    @Column(name = "new_value")
    private String newValue; // e.g., "IN_PROGRESS"

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private OffsetDateTime timestamp;

    // --- CONSTRUCTORS ---
    
    public TaskLog() {}

    // Convenience constructor for your TaskService to easily create logs
    public TaskLog(Task task, User user, String fieldName, String oldValue, String newValue) {
        this.task = task;
        this.user = user;
        this.fieldName = fieldName;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    // --- GETTERS & SETTERS ---

    public Integer getId() {
        return id;
    }
    // No setId() because it is managed by @GeneratedValue

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }
    // No setTimestamp() because it is managed by @CreationTimestamp
}