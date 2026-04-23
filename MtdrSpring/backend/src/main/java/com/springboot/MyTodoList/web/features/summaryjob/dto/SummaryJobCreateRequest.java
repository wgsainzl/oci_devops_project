package com.springboot.MyTodoList.web.features.summaryjob.dto;

import java.time.OffsetDateTime;

public class SummaryJobCreateRequest {
    private String telegramUserId;
    private OffsetDateTime weekStart;
    private OffsetDateTime weekEnd;

    public String getTelegramUserId() {
        return telegramUserId;
    }

    public void setTelegramUserId(String telegramUserId) {
        this.telegramUserId = telegramUserId;
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
}
