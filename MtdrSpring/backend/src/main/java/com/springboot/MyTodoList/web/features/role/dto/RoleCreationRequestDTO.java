package com.springboot.MyTodoList.web.features.role.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record RoleCreationRequestDTO(
        @NotBlank(message = "Role name cannot be empty")
        @Size(min = 3, max = 50, message = "Role name must be between 3 and 50 characters")
        @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Role name contains invalid characters. Only alphanumeric, hyphens, and underscores are allowed.")
        String name,
        String description,
        Set<String> permissions,
        boolean systemProtected,
        boolean cosmetic
) {
    // From initializer: name + description + systemProtected, no permissions yet
    public RoleCreationRequestDTO(String name, String description, boolean systemProtected) {
        this(name, description, Set.of(), systemProtected, false);
    }

    // From API: name + description + permissions, not system-protected
    public RoleCreationRequestDTO(String name, String description, Set<String> permissions) {
        this(name, description, permissions != null ? permissions : Set.of(), false, false);
    }
}
