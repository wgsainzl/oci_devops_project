package com.springboot.MyTodoList.web.features.role.dto;

import java.util.Set;

public record RoleResponseDTO(
        Long roleId,
        String name,
        String description,
        Set<String> permissions,
        boolean cosmetic
        ) {
}
