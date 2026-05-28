package com.springboot.telegrambot.command;

import com.springboot.telegrambot.dto.SprintDTO;
import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.dto.TaskStatus;
import com.springboot.telegrambot.messaging.TaskRpcClient;
import com.springboot.telegrambot.util.BotCommands;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.util.BotLabels;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ListTasksCommand implements BotCommand {

    private static final Logger logger = LoggerFactory.getLogger(ListTasksCommand.class);
    private final TelegramClient telegramClient;
    private final TaskRpcClient taskRpcClient;

    public ListTasksCommand(TelegramClient telegramClient, TaskRpcClient taskRpcClient) {
        this.telegramClient = telegramClient;
        this.taskRpcClient = taskRpcClient;
    }

    @Override
    public boolean supports(String messageText) {
        String text = messageText.trim();
        return text.startsWith(BotCommands.TODO_LIST.getCommand())
                || text.startsWith(BotLabels.LIST_ALL_ITEMS.getLabel())
                || text.startsWith(BotLabels.MY_TODO_LIST.getLabel());
    }

    @Override
    public void execute(CommandContext context) {
        long chatId = context.getChatId();
        String[] parts = context.getMessageText().trim().split("\\s+");
        
        Integer targetSprintId = null;
        TaskStatus targetStatus = null;

        for (int i = 1; i < parts.length; i++) {
            if (parts[i].matches("\\d+")) {
                targetSprintId = Integer.valueOf(parts[i]);
            } else {
                try {
                    targetStatus = TaskStatus.valueOf(parts[i].toUpperCase());
                } catch (IllegalArgumentException ignored) {}
            }
        }

        try {
            if (targetSprintId == null) {
                List<SprintDTO> allSprints = taskRpcClient.getAllSprintsByTeamId(context.getUserSession().getTeamId());
                //List<SprintDTO> allSprints = taskRpcClient.getAllSprints();
                if (allSprints != null && !allSprints.isEmpty()) {
                    targetSprintId = allSprints.stream()
                            .mapToInt(SprintDTO::getId)
                            .max()
                            .orElse(1); 
                }
            }

            if (targetSprintId == null) {
                BotHelper.sendHtmlMessageToTelegram(chatId, "No active sprints could be found.", telegramClient);
                return;
            }

            //List<TaskDTO> activeItems = taskRpcClient.getTasksForSprint(targetSprintId);
            List<TaskDTO> activeItems = taskRpcClient.getTasksForSprintByTeam(targetSprintId, context.getUserSession().getTeamId());

            if (targetStatus != null) {
                TaskStatus finalStatus = targetStatus;
                activeItems = activeItems.stream()
                        .filter(item -> item.getStatus() == finalStatus)
                        .collect(Collectors.toList());
            }

            StringBuilder sb = new StringBuilder();
            sb.append("<b>Tasks for Sprint ID: ").append(targetSprintId).append("</b>\n");
            if (targetStatus != null) {
                sb.append("<i>Filtered by: ").append(targetStatus).append("</i>\n");
            }
            sb.append("\n");

            if (activeItems == null || activeItems.isEmpty()) {
                sb.append("No tasks found matching your criteria.\n");
            } else {
                for (TaskDTO item : activeItems) {
                    String title = item.getTitle() != null ? item.getTitle() : "Unnamed Task";
                    sb.append("<b>ID: ").append(item.getTaskId()).append("</b> | <code>[").append(item.getStatus()).append("]</code>\n");
                    sb.append(title).append("\n\n");
                }
                sb.append("<i>To update a task, type:</i> <code>/updatetask &lt;ID&gt; &lt;STATUS&gt;</code>");
            }

            BotHelper.sendHtmlMessageToTelegram(chatId, sb.toString(), telegramClient);
        } catch (Exception e) {
            logger.error("Failed to fetch tasks", e);
            BotHelper.sendMessageToTelegram(chatId, "⚠️ Error: Cannot fetch tasks right now.", telegramClient);
        }
    }
}