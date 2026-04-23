package com.springboot.telegrambot.util;

import com.springboot.telegrambot.deepseek.DeepSeekService;
import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.dto.TaskStatus;
import com.springboot.telegrambot.client.BackendServiceClient;
import com.springboot.telegrambot.deepseek.DeepSeekService;


import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

public class BotActions {

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);

    String requestText;
    long chatId;
    TelegramClient telegramClient;
    boolean exit;

    BackendServiceClient backendServiceClient; // Replaced ToDoItemService
    DeepSeekService deepSeekService;

    public BotActions(TelegramClient tc, BackendServiceClient ts, DeepSeekService ds) {
        telegramClient = tc;
        backendServiceClient = ts;
        deepSeekService = ds;
        exit = false;
    }

    public void setRequestText(String cmd) { requestText = cmd; }
    public void setChatId(long chId) { chatId = chId; }
    public void setBackendServiceClient(BackendServiceClient tsvc) { backendServiceClient = tsvc; }
    public BackendServiceClient getBackendServiceClient() { return backendServiceClient; }

    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit) 
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient,  ReplyKeyboardMarkup
            .builder()
            .keyboardRow(new KeyboardRow(java.util.List.of(new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.LIST_ALL_ITEMS.getLabel()), new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.ADD_NEW_ITEM.getLabel()))))
            .keyboardRow(new KeyboardRow(java.util.List.of(new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.SHOW_MAIN_SCREEN.getLabel()), new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.HIDE_MAIN_SCREEN.getLabel()))))
            .build()
        );
        exit = true;
    }

    // Handles marking a task as DONE
    public void fnDone() {
        if (!requestText.contains(BotLabels.DONE.getLabel()) || exit) return;
            
        Integer id = Integer.valueOf(requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())));
        try {
            backendServiceClient.updateTaskStatus(id, "DONE"); // passing null for currentUserId for now
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    // NEW: Handles marking a task as BLOCKED
    public void fnBlock() {
        if (!requestText.contains(BotLabels.BLOCK.getLabel()) || exit) return;
            
        Integer id = Integer.valueOf(requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())));
        try {
            backendServiceClient.updateTaskStatus(id, "BLOCKED");
            BotHelper.sendMessageToTelegram(chatId, "TaskDTO flagged as BLOCKED. Your manager has been notified.", telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnDelete() {
        if (!requestText.contains(BotLabels.DELETE.getLabel()) || exit) return;

        Integer id = Integer.valueOf(requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())));
        try {
            backendServiceClient.deleteTask(id);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnListAll() {
        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand())
				|| requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
				|| requestText.equals(BotLabels.MY_TODO_LIST.getLabel())) || exit)
            return;
            
        List<TaskDTO> allItems = backendServiceClient.findAllTasks();
        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder().resizeKeyboard(true).build();
        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow mainScreenRowTop = new KeyboardRow();
        mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowTop);

        // Active Tasks (TODO, IN_PROGRESS, BLOCKED)
        List<TaskDTO> activeItems = allItems.stream()
                .filter(item -> item.getStatus() != TaskStatus.DONE)
                .collect(Collectors.toList());

        for (TaskDTO item : activeItems) {
            KeyboardRow currentRow = new KeyboardRow();
            String title = item.getTitle() != null ? item.getTitle() : "Unnamed Task";
            currentRow.add("[" + item.getStatus() + "] " + title);
            currentRow.add(item.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
            currentRow.add(item.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.BLOCK.getLabel());
            keyboard.add(currentRow);
        }

        keyboardMarkup.setKeyboard(keyboard);
        BotHelper.sendMessageToTelegram(chatId, "Here are your active tasks:", telegramClient,  keyboardMarkup);
        exit = true;
    }

    public void fnAddItem() {
		if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand())
				|| requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel())) || exit )
            return;
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_TODO_ITEM.getMessage(), telegramClient);
        exit = true;
    }

    // NEW: AI Sprint Reporter
        public void fnReport() {
        if (!requestText.startsWith(BotCommands.LLM_REPORT.getCommand()) || exit) return;
        
        // Expected format: /report <dev|manager> <id>
        String[] parts = requestText.split(" ");
        if (parts.length < 3) {
            BotHelper.sendMessageToTelegram(chatId, "Please specify role and ID. Example: /report dev 1  or  /report manager 1", telegramClient, null);
            return;
        }

        try {
            String role = parts[1].toLowerCase();
            Integer targetId = Integer.parseInt(parts[2]);
            
            if (role.equals("manager")) {
                BotHelper.sendMessageToTelegram(chatId, "⏳ Analyzing team activity logs for Manager...", telegramClient, null);
                
                // For a Manager, query the task logs and summarize recent activity
                List<Object[]> logs = backendServiceClient.getWeeklyTaskLogsSummary(targetId);
                String aiSummary = deepSeekService.generateLogsReport(targetId, logs);
                
                BotHelper.sendMessageToTelegram(chatId, "📊 **Manager Team Report**\n\n" + aiSummary, telegramClient, null);
                
            } else {
                BotHelper.sendMessageToTelegram(chatId, "⏳ Analyzing weekly tasks for Developer...", telegramClient, null);
                
                // For a Developer, query their specific task queue
                OffsetDateTime weekEnd = OffsetDateTime.now();
                OffsetDateTime weekStart = weekEnd.minusDays(7);
                List<TaskDTO> devTasks = backendServiceClient.getWeeklySummaryTasks(targetId, weekStart, weekEnd);
                String aiSummary = deepSeekService.generateSprintReport(targetId, devTasks);
                
                BotHelper.sendMessageToTelegram(chatId, "📊 **Developer Sprint Report**\n\n" + aiSummary, telegramClient, null);
            }
            
        } catch (NumberFormatException e) {
            BotHelper.sendMessageToTelegram(chatId, "Invalid ID format.", telegramClient, null);
        }
        exit = true;
    }

    public void fnElse() {
        if(exit) return;
        
        TaskDTO newTask = new TaskDTO();
        newTask.setTitle("New Chat Task");
        newTask.setDescription(requestText);
        newTask.setStatus(TaskStatus.TODO);
        backendServiceClient.createTask(newTask);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.NEW_ITEM_ADDED.getMessage(), telegramClient, null);
    }
}