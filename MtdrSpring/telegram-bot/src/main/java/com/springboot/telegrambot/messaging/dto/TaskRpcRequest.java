package com.springboot.telegrambot.messaging.dto;

import java.io.Serializable;

public class TaskRpcRequest implements Serializable {

    public enum QueryType {
        GET_ALL_TASKS, GET_TASKS_FOR_SPRINT, GET_USER_ROLE, GET_ALL_SPRINTS, GET_TASKS_BY_TEAMID, GET_TASKS_FOR_SPRINT_BY_TEAMID, GET_ALL_SPRINTS_BY_TEAMID, COMPLETE_TASK_BY_ID
    }

    private QueryType queryType;
    private Integer sprintId;
    private Integer teamId;
    private double actualHours;
    private String telegramId;

    public TaskRpcRequest() {}

    public QueryType getQueryType() { return queryType; }
    public void setQueryType(QueryType queryType) { this.queryType = queryType; }

    public Integer getSprintId() { return sprintId; }
    public void setSprintId(Integer sprintId) { this.sprintId = sprintId; }

    public Integer getTeamId(){ return teamId; }
    public void setTeamId(Integer teamId) {this.teamId = teamId; }

    public double getActualHours() {return actualHours; }
    public void setActualHours(double actualHours) { this.actualHours = actualHours; }

    public String getTelegramId() { return telegramId; }
    public void setTelegramId(String telegramId) { this.telegramId = telegramId; }
}