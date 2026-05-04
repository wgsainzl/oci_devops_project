package com.springboot.MyTodoList.web.messaging.dto;

import java.io.Serializable;

public class TaskRpcRequest implements Serializable {

    public enum QueryType {
        GET_ALL_TASKS, GET_TASKS_FOR_SPRINT, GET_USER_ROLE, GET_ALL_SPRINTS
    }

    private QueryType queryType;
    private Integer sprintId;
    private String telegramId;

    public TaskRpcRequest() {}

    public QueryType getQueryType() { return queryType; }
    public void setQueryType(QueryType queryType) { this.queryType = queryType; }

    public Integer getSprintId() { return sprintId; }
    public void setSprintId(Integer sprintId) { this.sprintId = sprintId; }

    public String getTelegramId() { return telegramId; }
    public void setTelegramId(String telegramId) { this.telegramId = telegramId; }
}