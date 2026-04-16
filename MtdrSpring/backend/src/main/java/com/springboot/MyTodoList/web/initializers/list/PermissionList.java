package com.springboot.MyTodoList.web.initializers.list;

import lombok.Getter;

@Getter
public enum PermissionList {
    // ADMIN
    ADMIN_OVERRIDE("ADMIN_OVERRIDE", "Bypasses all permission checks", "SYSTEM", "OVERRIDE"),

    // USER
    USER_READ("USER_READ", "Read user information", "USER", "READ"),
    USER_WRITE("USER_WRITE", "Create and update users", "USER", "WRITE"),
    USER_DELETE("USER_DELETE", "Delete users", "USER", "DELETE"),
    USER_MANAGE("USER_MANAGE", "Full user management", "USER", "MANAGE"),


    // ROLE
    ROLES_READ("ROLES_READ", "Read role information", "ROLES", "READ"),
    ROLES_WRITE("ROLES_WRITE", "Create and update roles", "ROLES", "WRITE"),
    ROLES_DELETE("ROLES_DELETE", "Delete roles", "ROLES", "DELETE"),
    ROLES_ASSIGN("ROLES_ASSIGN", "Assign/remove roles", "ROLES", "ASSIGN"),
    ROLES_MANAGE("ROLES_MANAGE", "Full role management", "ROLES", "MANAGE"),


    // TASK
    TASK_READ("TASK_READ", "Read any task", "TASK", "READ"),
    TASK_READ_OWN("TASK_READ_OWN", "Read own assigned tasks", "TASK", "READ_OWN"),
    TASK_WRITE("TASK_WRITE", "Create and edit any task", "TASK", "WRITE"),
    TASK_WRITE_OWN("TASK_WRITE_OWN", "Edit own assigned tasks", "TASK", "WRITE_OWN"),
    TASK_DELETE("TASK_DELETE", "Delete tasks", "TASK", "DELETE"),
    TASK_ASSIGN("TASK_ASSIGN", "Assign tasks to any user", "TASK", "ASSIGN"),
    TASK_ASSIGN_OWN("TASK_ASSIGN_OWN", "Pick up or reassign task to self", "TASK", "ASSIGN_OWN"),
    TASK_PRIORITIZE("TASK_PRIORITIZE", "Set and change task priority", "TASK", "PRIORITIZE"),
    TASK_STATUS_UPDATE("TASK_STATUS_UPDATE", "Move task across board columns", "TASK", "STATUS_UPDATE"),
    TASK_MANAGE("TASK_MANAGE", "Full task management", "TASK", "MANAGE"),


    // SPRINT
    SPRINT_READ("SPRINT_READ", "View sprints and backlog", "SPRINT", "READ"),
    SPRINT_WRITE("SPRINT_WRITE", "Create and edit sprints", "SPRINT", "WRITE"),
    SPRINT_START("SPRINT_START", "Start a sprint", "SPRINT", "START"),
    SPRINT_CLOSE("SPRINT_CLOSE", "Close and complete a sprint", "SPRINT", "CLOSE"),
    SPRINT_MANAGE("SPRINT_MANAGE", "Full sprint management", "SPRINT", "MANAGE"),


    // COMMENT
    COMMENT_READ("COMMENT_READ", "View comments on tasks", "COMMENT", "READ"),
    COMMENT_WRITE("COMMENT_WRITE", "Post comments on tasks", "COMMENT", "WRITE"),
    COMMENT_DELETE_OWN("COMMENT_DELETE_OWN", "Delete own comments", "COMMENT", "DELETE_OWN"),
    COMMENT_DELETE("COMMENT_DELETE", "Delete any comment", "COMMENT", "DELETE"),


    // REPORT
    REPORT_READ("REPORT_READ", "View team reports and charts", "REPORT", "READ"),
    REPORT_READ_OWN("REPORT_READ_OWN", "View own productivity stats", "REPORT", "READ_OWN"),
    REPORT_EXPORT("REPORT_EXPORT", "Export reports to CSV or PDF", "REPORT", "EXPORT");


    // Getters
    private final String name;
    private final String description;
    private final String resource;
    private final String action;

    PermissionList(String name, String description, String resource, String action) {
        this.name = name;
        this.description = description;
        this.resource = resource;
        this.action = action;
    }
    }
