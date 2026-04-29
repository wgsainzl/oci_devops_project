package com.springboot.telegrambot.dto;

import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SprintDTO {
    
    // Map the backend's "sprintId" to this field
    @JsonProperty("sprintId")
    private Integer id;

    // Map the backend's "sprintName" to this field
    @JsonProperty("sprintName")
    private String name;

    private OffsetDateTime startDate;
    private OffsetDateTime endDate;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public OffsetDateTime getStartDate() { return startDate; }
    public void setStartDate(OffsetDateTime startDate) { this.startDate = startDate; }

    public OffsetDateTime getEndDate() { return endDate; }
    public void setEndDate(OffsetDateTime endDate) { this.endDate = endDate; }
}