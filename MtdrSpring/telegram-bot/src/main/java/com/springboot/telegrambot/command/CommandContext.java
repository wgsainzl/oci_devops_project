package com.springboot.telegrambot.command;

import com.springboot.telegrambot.dto.UserSessionDTO;

public class CommandContext {
    private final long chatId;
    private final String messageText;
    private final UserSessionDTO userSession;

    public CommandContext(long chatId, String messageText, UserSessionDTO userSession) {
        this.chatId = chatId;
        this.messageText = messageText;
        this.userSession = userSession;
    }

    public long getChatId() { return chatId; }
    public String getMessageText() { return messageText; }
    public UserSessionDTO getUserSession() { return userSession; }
}