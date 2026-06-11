package com.springboot.telegrambot.command;

import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.messaging.TaskRpcClient;
import com.springboot.telegrambot.util.BotHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.List;

@Component
public class VectorSearch implements BotCommand {

    private static final Logger logger = LoggerFactory.getLogger(ListTasksCommand.class);
    private final TelegramClient telegramClient;
    private final TaskRpcClient taskRpcClient;

    public VectorSearch(TelegramClient telegramClient, TaskRpcClient taskRpcClient) {
        this.telegramClient = telegramClient;
        this.taskRpcClient = taskRpcClient;
    }

    @Override
    public boolean supports(String messageText) {
        return false;
    }

    @Override
    public void execute(CommandContext context) {
        long chatId = context.getChatId();
        String[] parts = context.getMessageText().trim().split("\\s+");
        
        

        try {
            //List<TaskDTO> activeItems = taskRpcClient.getTasksForSprint(targetSprintId);
            List<TaskDTO> items = taskRpcClient.getVectorSearch(context.getMessageText().trim());
            StringBuilder sb = new StringBuilder();

            if (!items.isEmpty()) {
                sb.append("<b>Tasks for query: </b>\n");
                for (TaskDTO item : items) {
                    String title = item.getTitle() != null ? item.getTitle() : "Unnamed Task";
                    sb.append("<b>ID: ").append(item.getTaskId()).append("</b> | <code>[").append(item.getStatus()).append("]</code>\n");
                    sb.append(title).append("\n\n");
                }
            } else {
                sb.append("No tasks found matching your query.\n"); 
            }


            BotHelper.sendHtmlMessageToTelegram(chatId, sb.toString(), telegramClient);
        } catch (Exception e) {
            logger.error("Failed to fetch tasks", e);
            BotHelper.sendMessageToTelegram(chatId, "Error: Cannot fetch tasks right now.", telegramClient);
        }
    }
}