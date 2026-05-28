package com.springboot.telegrambot.command;

import com.springboot.telegrambot.messaging.TaskCommandPublisher;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.util.BotMessages;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class CompleteTaskCommand implements BotCommand {

    private static final Logger logger = LoggerFactory.getLogger(CompleteTaskCommand.class);
    private final TelegramClient telegramClient;
    private final TaskCommandPublisher taskCommandPublisher;
    
    private final Pattern pattern = Pattern.compile("^(?i)(\\d+)\\s*[- ]\\s*DONE$");

    public CompleteTaskCommand(TelegramClient telegramClient, TaskCommandPublisher taskCommandPublisher) {
        this.telegramClient = telegramClient;
        this.taskCommandPublisher = taskCommandPublisher;
    }

    @Override
    public boolean supports(String messageText) {
        return pattern.matcher(messageText.trim()).matches();
    }

    @Override
    public void execute(CommandContext context) {
        long chatId = context.getChatId();
        Matcher matcher = pattern.matcher(context.getMessageText().trim());
        
        if (matcher.matches()) {
            Integer id = Integer.valueOf(matcher.group(1));
            try {
                taskCommandPublisher.updateTaskStatus(id, "DONE");
                BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), telegramClient);
            } catch (Exception e) {
                logger.error("Failed to complete task", e);
            }
        }
    }
}