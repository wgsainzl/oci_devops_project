package com.springboot.telegrambot.command;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import com.springboot.telegrambot.dto.TaskStatus;
import com.springboot.telegrambot.messaging.TaskCommandPublisher;
import com.springboot.telegrambot.util.BotCommands;
import com.springboot.telegrambot.util.BotHelper;

@Component
public class UpdateTaskCommand implements BotCommand {
    private final static Logger logger = LoggerFactory.getLogger(UpdateTaskCommand.class);
    private final TaskCommandPublisher taskCommandPublisher;
    private final TelegramClient telegramClient;

    public UpdateTaskCommand(TaskCommandPublisher taskCommandPublisher, TelegramClient telegramClient){
        this.taskCommandPublisher = taskCommandPublisher;
        this.telegramClient = telegramClient;
    } 

    @Override
    public boolean supports(String messageText){
        return messageText.trim().toLowerCase().startsWith(BotCommands.UPDATE_TASK.getCommand());
    }

    @Override
    public void execute(CommandContext context){
        String[] parts = context.getMessageText().trim().split("\\s+");
        long chatId = context.getChatId();
        if (parts.length != 3) {
            BotHelper.sendHtmlMessageToTelegram(chatId, 
                "<b>Invalid format.</b>\nUse: <code>/updatetask &lt;TaskID&gt; &lt;NEW_STATUS&gt;</code>", 
                telegramClient);
            return;
        }
        // add "try x command"
        try {
            int taskId = Integer.parseInt(parts[1]);
            String newStatus = parts[2].toUpperCase();
            TaskStatus.valueOf(newStatus); // Validates it's a real enum

            taskCommandPublisher.updateTaskStatus(taskId, newStatus, context.getUserSession().getTelegramUserId());
            BotHelper.sendHtmlMessageToTelegram(chatId, "<b>Task " + taskId + " updated to " + newStatus + "!</b>", telegramClient);

        } catch (IllegalArgumentException e) {
            BotHelper.sendHtmlMessageToTelegram(chatId, "<b>Invalid status.</b> Allowed: TODO, IN_PROGRESS, DONE, BLOCKED.", telegramClient);
        } catch (Exception e) {
            logger.error("Error updating task", e);
            BotHelper.sendMessageToTelegram(chatId, "Server error.", telegramClient);
        }
    }
    
}
