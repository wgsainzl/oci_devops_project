package com.springboot.MyTodoList.web.features.team;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

/* 
Name        Null?    Type                        
----------- -------- --------------------------- 
TEAM_ID     NOT NULL NUMBER(10)                  
TEAM_NAME   NOT NULL VARCHAR2(255)               
DESCRIPTION          VARCHAR2(500)               
MANAGER_ID           NUMBER                      
CREATED_AT  NOT NULL TIMESTAMP(6) WITH TIME ZONE 
UPDATED_AT           TIMESTAMP(6) WITH TIME ZONE
*/
@Entity
@Table(name = "TEAMS")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TEAM_ID")
    private Integer teamId;

    
    @Column(name = "TEAM_NAME")
    private String teamName;

    @Column(name="DESCRIPTION", length = 500)
    private String description;

    @Column(name = "MANAGER_ID")
    private Integer managerId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public Team() {}

    public Integer getTeamId() { return teamId; }
    public void setTeamId(Integer teamId) { this.teamId = teamId; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) {this.teamName = teamName; }
    public String getDescription() { return description; }
    public void setDescription(String description) {this.description = description;}
    public Integer getManagerId(){return managerId;}
    public void setManagerId(Integer managerId){this.managerId = managerId;}
    public OffsetDateTime getCreatedAt(){return createdAt;}
    public OffsetDateTime getUpdatedAt(){return updatedAt;}

}
