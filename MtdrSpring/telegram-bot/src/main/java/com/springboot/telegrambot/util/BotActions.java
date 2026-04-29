package com.springboot.telegrambot.util;
import java.time.OffsetDateTime;
import com.springboot.telegrambot.gemini.GeminiService;
import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.dto.TaskStatus;
import com.springboot.telegrambot.client.BackendServiceClient;


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
    GeminiService geminiService;

    public BotActions(TelegramClient tc, BackendServiceClient ts, GeminiService ds) {
        telegramClient = tc;
        backendServiceClient = ts;
        geminiService = ds;
        exit = false;
    }

    public void setRequestText(String cmd) { requestText = cmd; }
    public void setChatId(long chId) { chatId = chId; }
    public void setBackendServiceClient(BackendServiceClient tsvc) { backendServiceClient = tsvc; }
    public BackendServiceClient getBackendServiceClient() { return backendServiceClient; }

    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit) 
            return;

        KeyboardRow row1 = new KeyboardRow();
        row1.add(BotLabels.LIST_ALL_ITEMS.getLabel());
        row1.add(BotLabels.ADD_NEW_ITEM.getLabel());

        KeyboardRow row2 = new KeyboardRow();
        row2.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        row2.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());

        KeyboardRow row3 = new KeyboardRow();
        row3.add(BotLabels.GENERATE_REPORT.getLabel());

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient,  ReplyKeyboardMarkup
            .builder()
            .keyboardRow(row1)
            .keyboardRow(row2)
            .keyboardRow(row3)
            .resizeKeyboard(true)
            .build()
        );
        exit = true;
    }

    // Handles marking a task as DONE
    public void fnDone() {
        if (!requestText.contains(BotLabels.DONE.getLabel()) || exit) return;
            
        Integer id = Integer.valueOf(requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())));
        try {
            backendServiceClient.updateTaskStatus(id, "DONE");
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    // Handles marking a task as BLOCKED
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

    public void fnGenerateReport() {
        if (!(requestText.equals(BotCommands.LLM_REPORT.getCommand()) || 
            requestText.equals(BotLabels.GENERATE_REPORT.getLabel())) || exit) {
            return;
        }
            
        BotHelper.sendMessageToTelegram(chatId, "Generating your sprint report. Please wait...", telegramClient);

        try {

            java.util.Map<String, Object> userInfo = backendServiceClient.getUserRoleByTelegramId(String.valueOf(chatId));
            if (userInfo == null || userInfo.get("userId") == null) {
                BotHelper.sendMessageToTelegram(chatId, "Could not find a registered user linked to your Telegram account.", telegramClient);
                exit = true;
                return;
            }

            Integer userId = ((Number) userInfo.get("userId")).intValue();
            String role = (String) userInfo.get("role");

            OffsetDateTime weekEnd = OffsetDateTime.now();
            OffsetDateTime weekStart = weekEnd.minusMonths(1);
            
            OffsetDateTime monthStart = OffsetDateTime.now().minusMonths(1);
            String reportText;
            if ("MANAGER".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
                List<List<String>> logs = backendServiceClient.getAllTaskLogsSummary();
                logger.info("Logs fetched: {}", logs == null ? "null" : logs.size()); // ADD THIS
                reportText = geminiService.generateLogsReport(userId, logs);
            } else {
                List<TaskDTO> userTasks = backendServiceClient.getWeeklySummaryTasks(userId, weekStart, weekEnd);
                reportText = geminiService.generateSprintReport(userId, userTasks);
            }

            ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder().resizeKeyboard(true).build();
            List<KeyboardRow> keyboard = new ArrayList<>();
            KeyboardRow mainScreenRowTop = new KeyboardRow();
            mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
            keyboard.add(mainScreenRowTop);
            keyboardMarkup.setKeyboard(keyboard);

            if (reportText.length() > 4000) {
                for (int i = 0; i < reportText.length(); i += 4000) {
                    String chunk = reportText.substring(i, Math.min(reportText.length(), i + 4000));
                    boolean isLast = (i + 4000) >= reportText.length();
                    BotHelper.sendMessageToTelegram(chatId, chunk, telegramClient, isLast ? keyboardMarkup : null);
                }
            } else {
                BotHelper.sendMessageToTelegram(chatId, reportText, telegramClient, keyboardMarkup);
            }

        } catch (Exception e) {
        logger.error("Report generation failed", e); // ADD THIS
        BotHelper.sendMessageToTelegram(chatId, "Error: " + e.getMessage(), telegramClient);
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