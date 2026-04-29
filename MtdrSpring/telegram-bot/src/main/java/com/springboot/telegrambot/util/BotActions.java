package com.springboot.telegrambot.util;

import com.springboot.telegrambot.gemini.GeminiService;
import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.dto.TaskStatus;
import com.springboot.telegrambot.client.BackendServiceClient;

import java.time.OffsetDateTime;
import java.util.ArrayList;
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

    // --- HELPER: Button Generator ---
    private ReplyKeyboardMarkup createKeyboard(List<String> buttons) {
        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder().resizeKeyboard(true).build();
        List<KeyboardRow> keyboard = new ArrayList<>();
        
        KeyboardRow row = new KeyboardRow();
        for (String btn : buttons) {
            row.add(btn);
        }
        keyboard.add(row);
        
        KeyboardRow cancelRow = new KeyboardRow();
        cancelRow.add("/cancel");
        keyboard.add(cancelRow);
        
        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }

    // --- HELPER: Regex Matching for robust updates ---
    private Integer extractTaskIdForAction(String actionKeyword) {
        Pattern pattern = Pattern.compile("^(?i)(\\d+)\\s*[- ]\\s*" + actionKeyword + "$");
        Matcher matcher = pattern.matcher(requestText.trim());
        if (matcher.matches()) {
            return Integer.valueOf(matcher.group(1));
        }
        return null;
    }

    // --- HELPER: Prevent typos from creating new tasks ---
    private boolean isLikelyUpdateCommand() {
        String text = requestText.toLowerCase().trim();
        return text.matches("^\\d+.*") && 
               (text.contains("done") || text.contains("block") || text.contains("delete"));
    }

    // --- CENTRALIZED CANCEL COMMAND ---
    public void fnCancel() {
        if (!requestText.trim().equalsIgnoreCase("/cancel") || exit) return;
        
        if (activeDrafts.containsKey(chatId)) {
            activeDrafts.remove(chatId);
            BotHelper.sendMessageToTelegram(chatId, "❌ Task creation cancelled. You are back to the main menu.", telegramClient);
        } else {
            BotHelper.sendMessageToTelegram(chatId, "There is no active task draft to cancel.", telegramClient);
        }
        exit = true;
    }

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

    public void fnListSprints() {
        if (!requestText.trim().equalsIgnoreCase(BotCommands.SPRINTS_LIST.getCommand()) || exit) return;

        try {
            List<com.springboot.telegrambot.dto.SprintDTO> sprints = backendServiceClient.getAllSprints();
            StringBuilder sb = new StringBuilder("<b>Available Sprints:</b>\n\n");
            
            if (sprints == null || sprints.isEmpty()) {
                sb.append("No sprints found.");
            } else {
                for (com.springboot.telegrambot.dto.SprintDTO s : sprints) {
                    String name = s.getName() != null ? s.getName() : "Unnamed Sprint";
                    sb.append("<b>ID: ").append(s.getId()).append("</b> | ").append(name).append("\n");
                }
                sb.append("\n<i>To view tasks, type:</i> <code>/tasks [SprintID]</code>");
            }
            BotHelper.sendHtmlMessageToTelegram(chatId, sb.toString(), telegramClient);
        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId, "⚠️ Error: Cannot fetch sprints right now.", telegramClient);
            logger.error("Failed to fetch sprints", e);
        }
        exit = true;
    }

    public void fnListAll() {
        if (exit) return;
        
        String text = requestText.trim();
        boolean isListCmd = text.startsWith(BotCommands.TODO_LIST.getCommand())
                || text.startsWith(BotLabels.LIST_ALL_ITEMS.getLabel())
                || text.startsWith(BotLabels.MY_TODO_LIST.getLabel());
                
        if (!isListCmd) return;

        Integer targetSprintId = null;
        TaskStatus targetStatus = null;

        String[] parts = text.split("\\s+");
        for (int i = 1; i < parts.length; i++) {
            if (parts[i].matches("\\d+")) {
                targetSprintId = Integer.valueOf(parts[i]);
            } else {
                try {
                    targetStatus = TaskStatus.valueOf(parts[i].toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Ignore unrecognized statuses, it might be a typo
                }
            }
        }

        try {
            if (targetSprintId == null) {
                List<com.springboot.telegrambot.dto.SprintDTO> allSprints = backendServiceClient.getAllSprints();
                if (allSprints != null && !allSprints.isEmpty()) {
                    targetSprintId = allSprints.stream()
                            .mapToInt(com.springboot.telegrambot.dto.SprintDTO::getId)
                            .max()
                            .orElse(1); 
                }
            }

            if (targetSprintId == null) {
                BotHelper.sendHtmlMessageToTelegram(chatId, "No active sprints could be found.", telegramClient);
                exit = true;
                return;
            }

            List<TaskDTO> activeItems = backendServiceClient.getTasksForSprint(targetSprintId);

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
            BotHelper.sendMessageToTelegram(chatId, "⚠️ Error: Cannot fetch tasks right now.", telegramClient);
            logger.error("Failed to fetch tasks", e);
        }
        
        exit = true;
    }

    public void fnAddItem() {
        if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand())
                || requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel())) || exit )
            return;
            
        activeDrafts.put(chatId, new TaskDraftSession(TaskCreationState.AWAITING_TITLE));
        
        BotHelper.sendHtmlMessageToTelegram(chatId, "🛠️ <b>Let's create a new task!</b>\n<i>(You can type /cancel at any time to stop).</i>\n\nFirst, what is the <b>Title</b> of the task?", telegramClient);
        
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

            OffsetDateTime weekEnd = OffsetDateTime.now();
            OffsetDateTime weekStart = weekEnd.minusDays(7);
            List<TaskDTO> userTasks = backendServiceClient.getWeeklySummaryTasks(userId, weekStart, weekEnd);

            String reportText = geminiService.generateSprintReport(userId, userTasks);

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
            BotHelper.sendMessageToTelegram(chatId, "Sorry, I ran into an error while generating your report.", telegramClient);
            logger.error("Report generation failed", e);
        }

        exit = true;    
    }

    public void fnElse() {
        if(exit) return;
        
        if (isLikelyUpdateCommand()) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.UPDATE_FORMAT_ERROR.getMessage(), telegramClient);
            return;
        }
        
        TaskDTO newTask = new TaskDTO();
        newTask.setTitle("New Chat Task");
        newTask.setDescription(requestText);
        newTask.setStatus(TaskStatus.TODO);
        backendServiceClient.createTask(newTask);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.NEW_ITEM_ADDED.getMessage(), telegramClient, null);
    }

    public enum TaskCreationState {
        AWAITING_TITLE,
        AWAITING_DESCRIPTION,
        AWAITING_PRIORITY,
        AWAITING_SPRINT
    }

    public static class TaskDraftSession {
        public TaskCreationState state;
        public TaskDTO draftTask;

        public TaskDraftSession(TaskCreationState state) {
            this.state = state;
            this.draftTask = new TaskDTO();
        }
    }

    private static final java.util.concurrent.ConcurrentHashMap<Long, TaskDraftSession> activeDrafts = new java.util.concurrent.ConcurrentHashMap<>();

    public void processTaskWizard() {
        if (exit || !activeDrafts.containsKey(chatId)) return;

        TaskDraftSession session = activeDrafts.get(chatId);
        String text = requestText.trim();

        try {
            switch (session.state) {
                case AWAITING_TITLE:
                    session.draftTask.setTitle(text);
                    session.state = TaskCreationState.AWAITING_DESCRIPTION;
                    BotHelper.sendHtmlMessageToTelegram(chatId, "✅ <b>Title saved.</b>\n\nNow, type the <b>Description</b>:", telegramClient);
                    break;

                case AWAITING_DESCRIPTION:
                    session.draftTask.setDescription(text);
                    session.state = TaskCreationState.AWAITING_PRIORITY;
                    BotHelper.sendHtmlMessageWithKeyboard(chatId, "✅ <b>Description saved.</b>\n\nPlease select the <b>Priority</b> below:", telegramClient, createKeyboard(List.of("HIGH", "MEDIUM", "LOW")));
                    break;

                case AWAITING_PRIORITY:
                    session.draftTask.setPriority(text.toUpperCase());
                    session.state = TaskCreationState.AWAITING_SPRINT;
                    
                    List<com.springboot.telegrambot.dto.SprintDTO> sprints = backendServiceClient.getAllSprints();
                    List<String> sprintButtons = new ArrayList<>();
                    sprintButtons.add("0"); // Skip option
                    
                    StringBuilder sprintMsg = new StringBuilder("✅ <b>Priority saved.</b>\n\nFinally, select the <b>Sprint ID</b> this belongs to:\n\n");
                    
                    if (sprints != null && !sprints.isEmpty()) {
                        for (com.springboot.telegrambot.dto.SprintDTO s : sprints) {
                            String sprintIdStr = String.valueOf(s.getId());
                            sprintButtons.add(sprintIdStr);
                            String sprintName = s.getName() != null ? s.getName() : "Unnamed Sprint";
                            sprintMsg.append("• <b>").append(sprintIdStr).append("</b> - ").append(sprintName).append("\n");
                        }
                    } else {
                        sprintMsg.append("<i>(No active sprints found. Click 0 to skip).</i>");
                    }

                    BotHelper.sendHtmlMessageWithKeyboard(chatId, sprintMsg.toString(), telegramClient, createKeyboard(sprintButtons));
                    break;

                case AWAITING_SPRINT:
                    int sprintId;
                    try {
                        sprintId = Integer.parseInt(text);
                    } catch (NumberFormatException ex) {
                        BotHelper.sendMessageToTelegram(chatId, "⚠️ Please click one of the Sprint numbers from the menu, or type 0 to skip.", telegramClient);
                        return; 
                    }
                    
                    if (sprintId > 0) {
                        TaskDTO.SprintReference sprintRef = new TaskDTO.SprintReference();
                        sprintRef.setSprintId(sprintId);
                        session.draftTask.setSprint(sprintRef);
                    }
                    
                    session.draftTask.setStatus(TaskStatus.TODO);
                    
                    try {
                        backendServiceClient.createTaskFromTelegram(session.draftTask, String.valueOf(chatId));
                        activeDrafts.remove(chatId);
                        BotHelper.sendHtmlMessageToTelegram(chatId, "🎉 <b>Task Successfully Created!</b>\nType /tasks to view your active board.", telegramClient);
                    } catch (org.springframework.web.reactive.function.client.WebClientResponseException ex) {
                        BotHelper.sendHtmlMessageToTelegram(chatId, "⚠️ <b>Database Error:</b> The database rejected Sprint ID " + sprintId + ". Try selecting another, or type 0 to skip.", telegramClient);
                    }
                    break;
            }
        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId, "⚠️ I didn't quite understand that input. Please try again or type /cancel.", telegramClient);
        }
        
        exit = true; 
    }

    public void fnUpdateTask() {
        if (exit || !requestText.trim().toLowerCase().startsWith(BotCommands.UPDATE_TASK.getCommand())) return;

        String[] parts = requestText.trim().split("\\s+");
        
        if (parts.length != 3) {
            BotHelper.sendHtmlMessageToTelegram(chatId, 
                "⚠️ <b>Invalid format.</b>\nTo update a task, use: <code>/updatetask &lt;TaskID&gt; &lt;NEW_STATUS&gt;</code>\n\n<i>Example:</i> <code>/updatetask 123 IN_PROGRESS</code>", 
                telegramClient);
            exit = true;
            return;
        }

        try {
            int taskId = Integer.parseInt(parts[1]);
            String newStatus = parts[2].toUpperCase();
            
            try {
                TaskStatus.valueOf(newStatus); 
            } catch (IllegalArgumentException e) {
                BotHelper.sendHtmlMessageToTelegram(chatId, 
                    "⚠️ <b>Invalid status.</b>\nAllowed statuses are: <b>TODO, IN_PROGRESS, DONE, BLOCKED</b>.\n\n<i>Example:</i> <code>/updatetask " + taskId + " DONE</code>", 
                    telegramClient);
                exit = true;
                return;
            }

            backendServiceClient.updateTaskStatus(taskId, newStatus);
            BotHelper.sendHtmlMessageToTelegram(chatId, 
                "🎉 <b>Task " + taskId + " updated to " + newStatus + "!</b>\nType /tasks to view your active board.", 
                telegramClient);

        } catch (NumberFormatException e) {
            BotHelper.sendHtmlMessageToTelegram(chatId, 
                "⚠️ <b>Invalid Task ID.</b>\nPlease provide a valid number.\n\n<i>Example:</i> <code>/updatetask 123 IN_PROGRESS</code>", 
                telegramClient);
        } catch (Exception e) {
             BotHelper.sendMessageToTelegram(chatId, "⚠️ Sorry, something went wrong communicating with the server.", telegramClient);
        }

        exit = true;
    }
}