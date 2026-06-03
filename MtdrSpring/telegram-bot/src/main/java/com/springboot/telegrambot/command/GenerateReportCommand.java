package com.springboot.telegrambot.command;

import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.dto.UserSessionDTO;
import com.springboot.telegrambot.gemini.GeminiService;
import com.springboot.telegrambot.client.BackendServiceClient;
import com.springboot.telegrambot.util.BotCommands;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.util.BotLabels;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class GenerateReportCommand implements BotCommand {

    private static final Logger logger = LoggerFactory.getLogger(GenerateReportCommand.class);
    private final BackendServiceClient backendServiceClient;
    private final GeminiService geminiService;
    private final TelegramClient telegramClient;

    public GenerateReportCommand(BackendServiceClient backendServiceClient, GeminiService geminiService, TelegramClient telegramClient) {
        this.backendServiceClient = backendServiceClient;
        this.geminiService = geminiService;
        this.telegramClient = telegramClient;
    }

    @Override
    public boolean supports(String messageText) {
        String text = messageText.trim();
        return text.equals(BotCommands.LLM_REPORT.getCommand()) || text.equals(BotLabels.GENERATE_REPORT.getLabel());
    }

    @Override
    public void execute(CommandContext context) {
        long chatId = context.getChatId();
        UserSessionDTO user = context.getUserSession();

        // 1. Instantly check if user is registered using the Context
        if (user == null || user.getUserId() == null) {
            BotHelper.sendMessageToTelegram(chatId, "Could not find a registered user linked to your Telegram account.", telegramClient);
            return;
        }

        BotHelper.sendMessageToTelegram(chatId, "Generating your AI monthly summary...", telegramClient);

        try {
            OffsetDateTime weekEnd = OffsetDateTime.now();
            OffsetDateTime weekStart = weekEnd.minusMonths(1);

            // Let the backend handle the async job creation
            Long jobId = backendServiceClient.createSummaryJobPending(user.getTelegramUserId(), weekStart, weekEnd);
            backendServiceClient.markSummaryJobProcessing(jobId);

            String aiSummary;
            
            // 2. Access the role directly from the Context
            if ("MANAGER".equalsIgnoreCase(user.getRole()) || "ADMIN".equalsIgnoreCase(user.getRole())) {
                List<List<String>> logs = backendServiceClient.getAllTaskLogsSummary();
                aiSummary = geminiService.generateLogsReport(user.getUserId().intValue(), logs);
            } else {
                List<TaskDTO> tasks = backendServiceClient.getWeeklySummaryTasks(user.getUserId().intValue(), weekStart, weekEnd);
                aiSummary = geminiService.generateSprintReport(user.getUserId().intValue(), tasks);
            }

            backendServiceClient.markSummaryJobSent(jobId, aiSummary);
            
            // Send the final result! (Assuming you moved sendMarkdown to BotHelper)
            BotHelper.sendMarkdown(chatId, aiSummary, telegramClient);

        } catch (Exception e) {
            logger.error("Failed to generate AI report for telegramUserId={}", user.getTelegramUserId(), e);
            BotHelper.sendMessageToTelegram(chatId, "Could not generate report right now.", telegramClient);
        }
    }
}