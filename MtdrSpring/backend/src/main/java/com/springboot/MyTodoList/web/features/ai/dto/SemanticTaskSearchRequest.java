package com.springboot.MyTodoList.web.features.ai.dto;

public record SemanticTaskSearchRequest(
        String query,
        Integer limit
) {
}