package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.features.task.Task;
import com.springboot.MyTodoList.features.task.TaskStatus;
import com.springboot.MyTodoList.features.task.TaskService;
import com.springboot.MyTodoList.features.deepseek.DeepSeekService;
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

    TaskService taskService; // Replaced ToDoItemService
    DeepSeekService deepSeekService;

    public BotActions(TelegramClient tc, TaskService ts, DeepSeekService ds) {
        telegramClient = tc;
        taskService = ts;
        deepSeekService = ds;
        exit = false;
    }

    public void setRequestText(String cmd) { requestText = cmd; }
    public void setChatId(long chId) { chatId = chId; }
    public void setTaskService(TaskService tsvc) { taskService = tsvc; }
    public TaskService getTaskService() { return taskService; }

    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit) 
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient,  ReplyKeyboardMarkup
            .builder()
            .keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.ADD_NEW_ITEM.getLabel()))
            .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel()))
            .build()
        );
        exit = true;
    }

    // Handles marking a task as DONE
    public void fnDone() {
        if (!requestText.contains(BotLabels.DONE.getLabel()) || exit) return;
            
        Integer id = Integer.valueOf(requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())));
        try {
            taskService.updateTaskStatus(id, TaskStatus.DONE, null); // passing null for currentUserId for now
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
            taskService.updateTaskStatus(id, TaskStatus.BLOCKED, null);
            BotHelper.sendMessageToTelegram(chatId, "Task flagged as BLOCKED. Your manager has been notified.", telegramClient);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnDelete() {
        if (!requestText.contains(BotLabels.DELETE.getLabel()) || exit) return;

        Integer id = Integer.valueOf(requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())));
        try {
            taskService.deleteTaskItem(id);
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
            
        List<Task> allItems = taskService.findAll();
        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder().resizeKeyboard(true).build();
        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow mainScreenRowTop = new KeyboardRow();
        mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowTop);

        // Active Tasks (TODO, IN_PROGRESS, BLOCKED)
        List<Task> activeItems = allItems.stream()
                .filter(item -> item.getStatus() != TaskStatus.DONE)
                .collect(Collectors.toList());

        for (Task item : activeItems) {
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
        
        // Expected format: /report 1 (where 1 is the User ID)
        String[] parts = requestText.split(" ");
        if (parts.length < 2) {
            BotHelper.sendMessageToTelegram(chatId, "Please specify a developer ID. Example: /report 1", telegramClient, null);
            return;
        }

        try {
            Integer targetUserId = Integer.parseInt(parts[1]);
            List<Task> devTasks = taskService.getTasksByUserId(targetUserId);
            
            if(devTasks.isEmpty()) {
                BotHelper.sendMessageToTelegram(chatId, "No tasks found for Developer ID " + targetUserId, telegramClient, null);
                return;
            }

            BotHelper.sendMessageToTelegram(chatId, "⏳ Analyzing sprint data...", telegramClient, null);
            String aiSummary = deepSeekService.generateSprintReport(targetUserId, devTasks);
            
            BotHelper.sendMessageToTelegram(chatId, "📊 **Sprint Report**\\n\\n" + aiSummary, telegramClient, null);
            
        } catch (NumberFormatException e) {
            BotHelper.sendMessageToTelegram(chatId, "Invalid User ID format.", telegramClient, null);
        }
        exit = true;
    }

    public void fnElse() {
        if(exit) return;
        
        Task newTask = new Task();
        newTask.setTitle("New Chat Task");
        newTask.setDescription(requestText);
        newTask.setStatus(TaskStatus.TODO);
        taskService.createTask(newTask);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.NEW_ITEM_ADDED.getMessage(), telegramClient, null);
    }
}