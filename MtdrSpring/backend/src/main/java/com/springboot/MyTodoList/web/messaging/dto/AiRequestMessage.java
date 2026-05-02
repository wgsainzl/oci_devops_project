package com.springboot.MyTodoList.web.messaging.dto;

import java.io.Serializable;

public class AiRequestMessage implements Serializable {

    private Long chatId;
    private String telegramUserId;
    private Long jobId;
    private String role;

    public AiRequestMessage() {}

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public String getTelegramUserId() { return telegramUserId; }
    public void setTelegramUserId(String telegramUserId) { this.telegramUserId = telegramUserId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}