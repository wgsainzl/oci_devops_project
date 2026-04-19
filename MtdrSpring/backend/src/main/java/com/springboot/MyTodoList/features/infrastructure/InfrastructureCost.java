package com.springboot.MyTodoList.features.infrastructure;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "infrastructure_costs")
public class InfrastructureCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cost_id")
    private Integer costId;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "oci_service", nullable = false)
    private String ociService; // e.g., "OKE", "Autonomous DB"

    @Column(name = "daily_cost_usd", nullable = false)
    private Double dailyCostUsd;

    public InfrastructureCost() {}

    // Getters and Setters
    public Integer getCostId() { return costId; }
    public void setCostId(Integer costId) { this.costId = costId; }
    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }
    public String getOciService() { return ociService; }
    public void setOciService(String ociService) { this.ociService = ociService; }
    public Double getDailyCostUsd() { return dailyCostUsd; }
    public void setDailyCostUsd(Double dailyCostUsd) { this.dailyCostUsd = dailyCostUsd; }
}