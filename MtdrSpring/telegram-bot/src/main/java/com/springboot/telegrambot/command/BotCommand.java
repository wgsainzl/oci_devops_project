package com.springboot.telegrambot.command;

public interface BotCommand {
    boolean supports(String messageText);
    void execute(CommandContext context);
}
