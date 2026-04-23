package com.springboot.MyTodoList.web.features.summaryjob;

import com.springboot.MyTodoList.web.features.user.User;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "SUMMARY_JOBS")
public class SummaryJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JOB_ID")
    private Long jobId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "TARGET_ROLE", length = 50)
    private String targetRole;

    @Column(name = "WEEK_START", nullable = false)
    private OffsetDateTime weekStart;

    @Column(name = "WEEK_END", nullable = false)
    private OffsetDateTime weekEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 50)
    private SummaryJobStatus status;

    @Column(name = "RETRY_COUNT")
    private Integer retryCount;

    @Column(name = "ERROR_MESSAGE", length = 1000)
    private String errorMessage;

    @Column(name = "CREATED_AT", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private OffsetDateTime updatedAt;

    @Lob
    @Column(name = "GENERATED_SUMMARY")
    private String generatedSummary;

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public OffsetDateTime getWeekStart() {
        return weekStart;
    }

    public void setWeekStart(OffsetDateTime weekStart) {
        this.weekStart = weekStart;
    }

    public OffsetDateTime getWeekEnd() {
        return weekEnd;
    }

    public void setWeekEnd(OffsetDateTime weekEnd) {
        this.weekEnd = weekEnd;
    }

    public SummaryJobStatus getStatus() {
        return status;
    }

    public void setStatus(SummaryJobStatus status) {
        this.status = status;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getGeneratedSummary() {
        return generatedSummary;
    }

    public void setGeneratedSummary(String generatedSummary) {
        this.generatedSummary = generatedSummary;
    }
}
