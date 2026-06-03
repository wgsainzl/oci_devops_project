package com.springboot.telegrambot.command;

import com.rabbitmq.client.Return;
import com.springboot.telegrambot.messaging.TaskCommandPublisher;
import com.springboot.telegrambot.util.BotCommands;
import com.springboot.telegrambot.util.BotHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;


@Component
public class CompleteTaskCommand implements BotCommand {

    private static final Logger logger = LoggerFactory.getLogger(CompleteTaskCommand.class);
    private final TelegramClient telegramClient;
    private final TaskCommandPublisher taskCommandPublisher;
    
    //private final Pattern pattern = Pattern.compile("^(?i)(\\d+)\\s*[- ]\\s*DONE$");

    public CompleteTaskCommand(TelegramClient telegramClient, TaskCommandPublisher taskCommandPublisher) {
        this.telegramClient = telegramClient;
        this.taskCommandPublisher = taskCommandPublisher;
    }

    @Override
    public boolean supports(String messageText) {
        return messageText.trim().toLowerCase().startsWith(BotCommands.COMPLETE_TASK.getCommand());
    }

    @Override
    public void execute(CommandContext context) {
        long chatId = context.getChatId();
        
        String[] parts = context.getMessageText().trim().split("\\s+");
        if (parts.length !=3){
            BotHelper.sendHtmlMessageToTelegram(chatId, "\"<b>Invalid format.</b>\nUse: <code>/complete &lt;TaskID&gt; &lt;HOURS&gt;</code>", telegramClient);
            return;
        }
    

        try {
            int taskId = Integer.parseInt(parts[1]);
            double hours = Double.parseDouble(parts[2]);
            taskCommandPublisher.completeTask(taskId, hours, context.getUserSession().getTelegramUserId());
                        BotHelper.sendHtmlMessageToTelegram(chatId, "<b>Task " + taskId + " completed with " + hours + " actual hours!</b>", telegramClient);
        } catch (Exception e){
            logger.error("Error updating task", e);
        }
    }
}