package com.springboot.MyTodoList.web.config;

import lombok.Getter;

import java.util.Set;

@Getter
public enum DefaultRoleConfig {

    ADMIN("ADMIN", "Full system access", true, Set.of(
            "ADMIN_OVERRIDE"
    )),

    MANAGER("MANAGER", "Project and team management", false, Set.of(
            // User
            "USER_READ",
            // Task
            "TASK_READ",
            "TASK_READ_OWN",
            "TASK_WRITE",
            "TASK_WRITE_OWN",
            "TASK_DELETE",
            "TASK_ASSIGN",
            "TASK_ASSIGN_OWN",
            "TASK_PRIORITIZE",
            "TASK_STATUS_UPDATE",
            "TASK_MANAGE",
            // Sprint
            "SPRINT_READ",
            "SPRINT_WRITE",
            "SPRINT_START",
            "SPRINT_CLOSE",
            "SPRINT_MANAGE",
            // Comment
            "COMMENT_READ",
            "COMMENT_WRITE",
            "COMMENT_DELETE_OWN",
            "COMMENT_DELETE",
            // Report
            "REPORT_READ",
            "REPORT_READ_OWN",
            "REPORT_EXPORT"
    )),

    DEV("DEV", "Software developer role", false, Set.of(
            // User
            "USER_READ",
            // Task
            "TASK_READ_OWN",
            "TASK_WRITE_OWN",
            "TASK_ASSIGN_OWN",
            "TASK_STATUS_UPDATE",
            // Sprint
            "SPRINT_READ",
            // Comment
            "COMMENT_READ",
            "COMMENT_WRITE",
            "COMMENT_DELETE_OWN",
            // Report
            "REPORT_READ_OWN"
    ));

    private final String name;
    private final String description;
    private final boolean systemProtected;
    private final Set<String> permissionNames;

    DefaultRoleConfig(String name, String description, boolean systemProtected, Set<String> permissionNames) {
        this.name = name;
        this.description = description;
        this.systemProtected = systemProtected;
        this.permissionNames = permissionNames;
    }

}
