package com.springboot.telegrambot.util;

import com.springboot.telegrambot.client.BackendServiceClient;
import com.springboot.telegrambot.deepseek.DeepSeekService;
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
    private final DeepSeekService deepSeekService;

    public MyTodoListBot(
            @Value("${telegram.bot.token}") String telegramBotToken,
            BackendServiceClient backendServiceClient,
            DeepSeekService deepSeekService) {
        this.telegramBotToken = telegramBotToken;
        this.backendServiceClient = backendServiceClient;
        this.deepSeekService = deepSeekService;
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

        sendText(chatId, "Echo: " + messageText + "\n\nUse /report <userId> <weekStartISO> <weekEndISO> to generate your AI weekly summary.");
    }

    private void handleReportCommand(long chatId, String telegramUserId, String messageText) {
        String[] parts = messageText.split("\\s+");
        if (parts.length < 4) {
            sendText(chatId, "Usage: /report <userId> <weekStartISO> <weekEndISO>\n"
                    + "Example: /report 1 2026-04-13T00:00:00Z 2026-04-20T00:00:00Z");
            return;
        }

        Integer userId;
        OffsetDateTime weekStart;
        OffsetDateTime weekEnd;
        try {
            userId = Integer.valueOf(parts[1]);
            weekStart = OffsetDateTime.parse(parts[2]);
            weekEnd = OffsetDateTime.parse(parts[3]);
        } catch (Exception e) {
            sendText(chatId, "Invalid command format. Usage: /report <userId> <weekStartISO> <weekEndISO>");
            return;
        }

        Long jobId = null;
        try {
            sendText(chatId, "Generating your AI weekly summary...");
            if (telegramUserId == null || telegramUserId.isBlank()) {
                throw new IllegalArgumentException("Missing telegram user id in update payload.");
            }

            jobId = backendServiceClient.createSummaryJobPending(telegramUserId, weekStart, weekEnd);
            backendServiceClient.markSummaryJobProcessing(jobId);

            List<TaskDTO> tasks = backendServiceClient.getWeeklySummaryTasks(userId, weekStart, weekEnd);
            String aiSummary = deepSeekService.generateSprintReport(userId, tasks);
            backendServiceClient.markSummaryJobSent(jobId, aiSummary);
            sendMarkdown(chatId, aiSummary);
        } catch (Exception e) {
            logger.error("Failed to generate AI report for userId={}", userId, e);
            if (jobId != null) {
                try {
                    backendServiceClient.markSummaryJobFailed(jobId, e.getMessage());
                } catch (Exception nested) {
                    logger.error("Failed to update summary job as FAILED for jobId={}", jobId, nested);
                }
            }
            sendText(chatId, "Could not generate report right now. Please verify backend and DeepSeek settings.");
        }
    }

    private void sendText(long chatId, String text) {
        SendMessage message = SendMessage.builder()
                .chatId(chatId)
                .text(text)
                .build();
        try {
            telegramClient.execute(message);
        } catch (TelegramApiException e) {
            logger.error("Failed to send Telegram message to chatId={}", chatId, e);
        }
    }

    private void sendMarkdown(long chatId, String markdownText) {
        String telegramHtml = toTelegramHtml(markdownText);
        SendMessage message = SendMessage.builder()
                .chatId(chatId)
                .text(telegramHtml)
                .parseMode(ParseMode.HTML)
                .build();
        try {
            telegramClient.execute(message);
        } catch (TelegramApiException e) {
            logger.warn("Formatted message parsing failed, sending plain text to chatId={}", chatId, e);
            sendText(chatId, markdownText);
        }
    }

    private String toTelegramHtml(String markdownText) {
        String[] lines = markdownText.split("\\r?\\n");
        StringBuilder html = new StringBuilder();
        for (String rawLine : lines) {
            String line = rawLine == null ? "" : rawLine.trim();
            if (line.startsWith("## ")) {
                html.append("<b>").append(escapeHtml(line.substring(3))).append("</b>\n");
            } else if (line.startsWith("# ")) {
                html.append("<b>").append(escapeHtml(line.substring(2))).append("</b>\n");
            } else if (line.startsWith("- ")) {
                html.append("• ").append(escapeHtml(line.substring(2))).append("\n");
            } else {
                html.append(escapeHtml(rawLine)).append("\n");
            }
        }
        return html.toString().trim();
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