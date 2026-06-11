package com.springboot.MyTodoList.web.features.ai.dto;

public record SemanticTaskSearchResult(
        Long taskId,
        String title,
        String description,
        String status,
        String priority,
        Long sprintId,
        Long responsibleId,
        String responsibleName,
        Double distance,
        String contentPreview
) {
}