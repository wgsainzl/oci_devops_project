package com.springboot.MyTodoList.web.messaging.dto;

import java.io.Serializable;
import java.time.OffsetDateTime;

public class SprintDTO implements Serializable {

    private Integer sprintId;
    private String sprintName;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;

    public SprintDTO() {}

    public Integer getSprintId() { return sprintId; }
    public void setSprintId(Integer sprintId) { this.sprintId = sprintId; }

    public String getSprintName() { return sprintName; }
    public void setSprintName(String sprintName) { this.sprintName = sprintName; }

    public OffsetDateTime getStartDate() { return startDate; }
    public void setStartDate(OffsetDateTime startDate) { this.startDate = startDate; }

    public OffsetDateTime getEndDate() { return endDate; }
    public void setEndDate(OffsetDateTime endDate) { this.endDate = endDate; }
}