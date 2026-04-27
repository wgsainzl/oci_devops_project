package com.springboot.telegrambot.util;

import com.springboot.telegrambot.client.BackendServiceClient;
import com.springboot.telegrambot.deepseek.DeepSeekService;
import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.dto.TaskStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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

    BackendServiceClient backendServiceClient;
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

    // --- NEW: Helper for Phase 2 Regex Parsing ---
    private Integer extractTaskIdForAction(String actionKeyword) {
        // Matches e.g., "123-DONE", "123 DONE", "123 - done"
        Pattern pattern = Pattern.compile("^(?i)(\\d+)\\s*[- ]\\s*" + actionKeyword + "$");
        Matcher matcher = pattern.matcher(requestText.trim());
        if (matcher.matches()) {
            return Integer.valueOf(matcher.group(1));
        }
        return null;
    }

    // --- NEW: Helper for Phase 3 Safety Trap ---
    private boolean isLikelyUpdateCommand() {
        String text = requestText.toLowerCase().trim();
        // Starts with a number and contains an action word, but failed the strict regex above
        return text.matches("^\\d+.*") && 
               (text.contains("done") || text.contains("block") || text.contains("delete"));
    }

    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit) 
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient,  ReplyKeyboardMarkup
            .builder()
            .keyboardRow(new KeyboardRow(List.of(new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.LIST_ALL_ITEMS.getLabel()), new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.ADD_NEW_ITEM.getLabel()))))
            .keyboardRow(new KeyboardRow(List.of(new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.SHOW_MAIN_SCREEN.getLabel()), new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.HIDE_MAIN_SCREEN.getLabel()))))
            .keyboardRow(new KeyboardRow(List.of(new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.GENERATE_REPORT.getLabel()))))
            .build()
        );
        exit = true;
    }

    public void fnDone() {
        if (exit) return;
        Integer id = extractTaskIdForAction("DONE");
        if (id != null) {
            try {
                backendServiceClient.updateTaskStatus(id, "DONE");
                BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), telegramClient);
            } catch (Exception e) {
                logger.error(e.getLocalizedMessage(), e);
            }
            exit = true;
        }
    }

    public void fnBlock() {
        if (exit) return;
        Integer id = extractTaskIdForAction("BLOCK");
        if (id != null) {
            try {
                backendServiceClient.updateTaskStatus(id, "BLOCKED");
                BotHelper.sendMessageToTelegram(chatId, "Task flagged as BLOCKED. Your manager has been notified.", telegramClient);
            } catch (Exception e) {
                logger.error(e.getLocalizedMessage(), e);
            }
            exit = true;
        }
    }

    public void fnDelete() {
        if (exit) return;
        Integer id = extractTaskIdForAction("DELETE");
        if (id != null) {
            try {
                backendServiceClient.deleteTask(id);
                BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), telegramClient);
            } catch (Exception e) {
                logger.error(e.getLocalizedMessage(), e);
            }
            exit = true;
        }
    }

    // --- UPDATED: Phase 1 Sprint View ---
    public void fnListAll() {
        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand())
                || requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
                || requestText.equals(BotLabels.MY_TODO_LIST.getLabel())) || exit)
            return;
            
        Integer userId = (int) chatId;
        OffsetDateTime weekEnd = OffsetDateTime.now();
        OffsetDateTime weekStart = weekEnd.minusDays(7);

        // Fetch only sprint tasks, avoiding database bloat
        List<TaskDTO> activeItems = backendServiceClient.getWeeklySummaryTasks(userId, weekStart, weekEnd)
                .stream()
                .filter(item -> item.getStatus() != TaskStatus.DONE)
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("<b>Current Sprint Tasks</b>\n\n");

        if (activeItems.isEmpty()) {
            sb.append("You have no active tasks for this sprint. Great job!\n");
        } else {
            for (TaskDTO item : activeItems) {
                String title = item.getTitle() != null ? item.getTitle() : "Unnamed Task";
                sb.append("<b>ID: ").append(item.getTaskId()).append("</b> | <code>[").append(item.getStatus()).append("]</code>\n");
                sb.append(title).append("\n\n");
            }
            sb.append("<i>To update a task, type:</i> <code>ID-DONE</code> <i>or</i> <code>ID-BLOCK</code>");
        }

        // Send using the new HTML-enabled helper
        BotHelper.sendHtmlMessageToTelegram(chatId, sb.toString(), telegramClient);
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
        // Left untouched as requested
        if (!(requestText.equals(BotCommands.LLM_REPORT.getCommand()) || 
            requestText.equals(BotCommands.GENERATE_REPORT.getCommand())) || exit) {
            return;
        }
            
        BotHelper.sendMessageToTelegram(chatId, "Generating your sprint report. Please wait...", telegramClient);

        try {
            Integer userId = (int) chatId;
            // Assuming this uses the overloaded method or default week span if not specified in your implementation
            List<TaskDTO> userTasks = backendServiceClient.getWeeklySummaryTasks(userId, OffsetDateTime.now().minusDays(7), OffsetDateTime.now());

            String reportText = deepSeekService.generateSprintReport(userId, userTasks);

            ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder().resizeKeyboard(true).build();
            List<KeyboardRow> keyboard = new ArrayList<>();
            KeyboardRow mainScreenRowTop = new KeyboardRow();
            mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
            keyboard.add(mainScreenRowTop);
            keyboardMarkup.setKeyboard(keyboard);

            BotHelper.sendMessageToTelegram(chatId, reportText, telegramClient, keyboardMarkup);

        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId, "Sorry, I ran into an error while generating your report.", telegramClient);
        }

        exit = true;    
    }

    // --- UPDATED: Phase 3 Trap ---
    public void fnElse() {
        if(exit) return;

        // Catch typos so we don't create tasks named "101 DONE"
        if (isLikelyUpdateCommand()) {
            BotHelper.sendMessageToTelegram(chatId, "It looks like you're trying to update a task. Please use the format ID-ACTION (e.g., 123-DONE or 123-BLOCK).", telegramClient);
            return;
        }
        
        TaskDTO newTask = new TaskDTO();
        newTask.setTitle("New Chat Task");
        newTask.setDescription(requestText);
        newTask.setStatus(TaskStatus.TODO);
        backendServiceClient.createTask(newTask);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.NEW_ITEM_ADDED.getMessage(), telegramClient, null);
    }
}