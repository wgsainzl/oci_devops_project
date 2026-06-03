package com.springboot.telegrambot.command;

import com.springboot.telegrambot.dto.SprintDTO;
import com.springboot.telegrambot.messaging.TaskRpcClient;
import com.springboot.telegrambot.util.BotCommands;
import com.springboot.telegrambot.util.BotHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.List;

@Component
public class ListSprintsCommand implements BotCommand {

    private static final Logger logger = LoggerFactory.getLogger(ListSprintsCommand.class);
    private final TelegramClient telegramClient;
    private final TaskRpcClient taskRpcClient;

    public ListSprintsCommand(TelegramClient telegramClient, TaskRpcClient taskRpcClient) {
        this.telegramClient = telegramClient;
        this.taskRpcClient = taskRpcClient;
    }

    @Override
    public boolean supports(String messageText) {
        return messageText.trim().equalsIgnoreCase(BotCommands.SPRINTS_LIST.getCommand());
    }

    @Override
    public void execute(CommandContext context) {
        long chatId = context.getChatId();
        
        try {
            //List<SprintDTO> sprints = taskRpcClient.getAllSprints();
            List<SprintDTO> sprints = taskRpcClient.getAllSprintsByTeamId(context.getUserSession().getTeamId());
            StringBuilder sb = new StringBuilder("<b>Available Sprints:</b>\n\n");
            
            if (sprints == null || sprints.isEmpty()) {
                sb.append("No sprints found.");
            } else {
                for (SprintDTO s : sprints) {
                    String name = s.getName() != null ? s.getName() : "Unnamed Sprint";
                    sb.append("<b>ID: ").append(s.getId()).append("</b> | ").append(name).append("\n");
                }
                sb.append("\n<i>To view tasks, type:</i> <code>/tasks [SprintID]</code>");
            }
            BotHelper.sendHtmlMessageToTelegram(chatId, sb.toString(), telegramClient);
        } catch (Exception e) {
            logger.error("Failed to fetch sprints", e);
            BotHelper.sendMessageToTelegram(chatId, "Error: Cannot fetch sprints right now.", telegramClient);
        }
    }
}