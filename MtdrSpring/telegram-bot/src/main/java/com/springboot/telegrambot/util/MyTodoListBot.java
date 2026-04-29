package com.springboot.telegrambot.util;
import java.time.OffsetDateTime;
import com.springboot.telegrambot.client.BackendServiceClient;
import com.springboot.telegrambot.gemini.GeminiService;
import com.springboot.telegrambot.dto.TaskDTO;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
import org.telegram.telegrambots.longpolling.BotSession;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.AfterBotRegistration;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.methods.ParseMode;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class MyTodoListBot implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

    private static final Logger logger = LoggerFactory.getLogger(MyTodoListBot.class);

    private final TelegramClient telegramClient;
    private final String telegramBotToken;
    private final BackendServiceClient backendServiceClient;
    private final GeminiService geminiService;

    public MyTodoListBot(
            @Value("${telegram.bot.token}") String telegramBotToken,
            BackendServiceClient backendServiceClient,
            GeminiService geminiService) {
        if (telegramBotToken == null || telegramBotToken.isBlank() || telegramBotToken.contains("${")) {
            logger.error("WARNING: Telegram Bot Token is missing or not resolved. Current value: '" + telegramBotToken + "'");
        }
        this.telegramBotToken = telegramBotToken;
        this.backendServiceClient = backendServiceClient;
        this.geminiService = geminiService;
        this.telegramClient = new OkHttpTelegramClient(telegramBotToken);
    }

    @Override
    public String getBotToken() {
        return telegramBotToken;
    }

    @Override
    public LongPollingUpdateConsumer getUpdatesConsumer() {
        return this;
    }

    @Override
    public void consume(Update update) {
        if (!update.hasMessage() || !update.getMessage().hasText()) {
            return;
        }

        String messageText = update.getMessage().getText().trim();
        long chatId = update.getMessage().getChatId();

        if (messageText.startsWith(BotCommands.LLM_REPORT.getCommand())) {
            String telegramUserId = update.getMessage().getFrom() != null
                    ? String.valueOf(update.getMessage().getFrom().getId())
                    : null;
            handleReportCommand(chatId, telegramUserId, messageText);
            return;
        }

        BotActions actions = new BotActions(telegramClient, backendServiceClient, geminiService);
        actions.setRequestText(messageText);
        actions.setChatId(chatId);

        actions.fnStart();
        if (messageText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel()) || messageText.equals(BotCommands.HIDE_COMMAND.getCommand())) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), telegramClient);
        } else {
            //actions.fnCancel();
            actions.processTaskWizard();
            actions.fnUpdateTask();
            actions.fnDone();
            actions.fnBlock();
            actions.fnDelete();
            actions.fnListSprints();
            actions.fnListAll();
            actions.fnAddItem();
            actions.fnGenerateReport();
            
            actions.fnElse();
        }
    }

    private void handleReportCommand(long chatId, String telegramUserId, String messageText) {
        if (telegramUserId == null || telegramUserId.isBlank()) {
            sendText(chatId, "Missing telegram user id in update payload.");
            return;
        }

        try {
            sendText(chatId, "Identifying your role from the database...");
            java.util.Map<String, Object> userInfo = backendServiceClient.getUserRoleByTelegramId(telegramUserId);
            if (userInfo == null || userInfo.get("userId") == null) {
                sendText(chatId, "Could not find a registered user linked to your Telegram account.");
                return;
            }

            Integer userId = ((Number) userInfo.get("userId")).intValue();
            String role = (String) userInfo.get("role");

            OffsetDateTime weekEnd = OffsetDateTime.now();
            OffsetDateTime weekStart = weekEnd.minusMonths(1);
            OffsetDateTime monthStart = OffsetDateTime.now().minusMonths(1); // ✅ definido aquí

            sendText(chatId, "Generating your AI monthly summary...");
            Long jobId = backendServiceClient.createSummaryJobPending(telegramUserId, weekStart, weekEnd);
            backendServiceClient.markSummaryJobProcessing(jobId);

            String aiSummary;
            if ("MANAGER".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
                List<List<String>> logs = backendServiceClient.getAllTaskLogsSummary();
                aiSummary = geminiService.generateLogsReport(userId, logs);
            } else {
                List<TaskDTO> tasks = backendServiceClient.getWeeklySummaryTasks(userId, weekStart, weekEnd);
                aiSummary = geminiService.generateSprintReport(userId, tasks);
            }

            backendServiceClient.markSummaryJobSent(jobId, aiSummary);
            sendMarkdown(chatId, aiSummary);

        } catch (Exception e) {
            logger.error("Failed to generate AI report for telegramUserId={}", telegramUserId, e);
            sendText(chatId, "Could not generate report right now. Please verify backend and Gemini settings.");
        }
    }

    private void sendText(long chatId, String text) {
        if (text == null || text.isEmpty()) return;
        int maxLength = 4000; // Telegram limit is 4096
        for (int i = 0; i < text.length(); i += maxLength) {
            String chunk = text.substring(i, Math.min(text.length(), i + maxLength));
            SendMessage message = SendMessage.builder()
                    .chatId(chatId)
                    .text(chunk)
                    .build();
            try {
                telegramClient.execute(message);
            } catch (TelegramApiException e) {
                logger.error("Failed to send Telegram message to chatId={}", chatId, e);
            }
        }
    }

    private void sendMarkdown(long chatId, String markdownText) {
        String telegramHtml = toTelegramHtml(markdownText);
        
        if (telegramHtml.length() <= 4000) {
            sendHtmlChunk(chatId, telegramHtml, markdownText);
            return;
        }

        // Message is too long, chunk it by lines to avoid breaking HTML tags
        String[] lines = telegramHtml.split("\n");
        StringBuilder currentChunk = new StringBuilder();
        
        for (String line : lines) {
            if (currentChunk.length() + line.length() + 1 > 4000) {
                sendHtmlChunk(chatId, currentChunk.toString(), currentChunk.toString().replaceAll("<[^>]*>", ""));
                currentChunk = new StringBuilder();
            }
            currentChunk.append(line).append("\n");
        }
        if (currentChunk.length() > 0) {
            sendHtmlChunk(chatId, currentChunk.toString(), currentChunk.toString().replaceAll("<[^>]*>", ""));
        }
    }

    private void sendHtmlChunk(long chatId, String htmlText, String fallbackText) {
        SendMessage message = SendMessage.builder()
                .chatId(chatId)
                .text(htmlText)
                .parseMode(ParseMode.HTML)
                .build();
        try {
            telegramClient.execute(message);
        } catch (TelegramApiException e) {
            logger.warn("Formatted message parsing failed, sending plain text to chatId={}", chatId, e);
            sendText(chatId, fallbackText);
        }
    }

    private String toTelegramHtml(String markdownText) {
        String[] lines = markdownText.split("\\r?\\n");
        StringBuilder html = new StringBuilder();
        for (String rawLine : lines) {
            String line = rawLine == null ? "" : rawLine.trim();
            if (line.startsWith("### ")) {
                html.append("<b>").append(escapeHtml(line.substring(4))).append("</b>\n");
            } else if (line.startsWith("## ")) {
                html.append("<b>").append(escapeHtml(line.substring(3))).append("</b>\n");
            } else if (line.startsWith("# ")) {
                html.append("<b>").append(escapeHtml(line.substring(2))).append("</b>\n");
            } else if (line.startsWith("- ")) {
                html.append("• ").append(escapeHtml(line.substring(2))).append("\n");
            } else {
                html.append(escapeHtml(rawLine)).append("\n");
            }
        }
        
        String result = html.toString().trim();
        // Convert ** bold ** to <b> bold </b>
        result = result.replaceAll("\\*\\*(.*?)\\*\\*", "<b>$1</b>");
        // Convert * italic * to <i> italic </i>
        result = result.replaceAll("(?<!\\*)\\*(?!\\*)(.*?)(?<!\\*)\\*(?!\\*)", "<i>$1</i>");
        // Convert ` code ` to <code> code </code>
        result = result.replaceAll("`([^`]+)`", "<code>$1</code>");
        
        return result;
    }

    private String escapeHtml(String text) {
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    @AfterBotRegistration
    public void afterRegistration(BotSession botSession) {
        System.out.println("Registered bot running state is: " + botSession.isRunning());
    }
}