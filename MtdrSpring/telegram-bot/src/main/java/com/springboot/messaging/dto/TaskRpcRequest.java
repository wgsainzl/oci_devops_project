package com.springboot.telegrambot.messaging.dto;

import java.io.Serializable;

public class TaskRpcRequest implements Serializable {

    public enum QueryType {
        GET_ALL_TASKS, GET_TASKS_FOR_SPRINT, GET_USER_ROLE, GET_ALL_SPRINTS
    }

    private QueryType queryType;
    private Integer sprintId;
    private String telegramId;
    private String correlationId;
    private String replyTo;

    public TaskRpcRequest() {}

    public QueryType getQueryType() { return queryType; }
    public void setQueryType(QueryType queryType) { this.queryType = queryType; }

    public Integer getSprintId() { return sprintId; }
    public void setSprintId(Integer sprintId) { this.sprintId = sprintId; }

    public String getTelegramId() { return telegramId; }
    public void setTelegramId(String telegramId) { this.telegramId = telegramId; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getReplyTo() { return replyTo; }
    public void setReplyTo(String replyTo) { this.replyTo = replyTo; }
}