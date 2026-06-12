package com.springboot.telegrambot.command;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import com.springboot.telegrambot.dto.UserSessionDTO;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.util.UserSessionManager;
import com.springboot.telegrambot.wizard.TaskWizardManager;
import com.springboot.telegrambot.wizard.TaskWizardProcessor;

@Service
public class BotCommandRouter {
    private final List<BotCommand> availableCommands;
    private final TelegramClient telegramClient;
    private final UserSessionManager userSessionManager;
    private final TaskWizardManager wizardManager;
    private final TaskWizardProcessor wizardProcessor;
    private final VectorSearch vectorSearch;
    
    @Autowired
    public BotCommandRouter(List<BotCommand> availableCommands, TelegramClient telegramClient,  UserSessionManager userSessionManager, TaskWizardManager wizardManager, TaskWizardProcessor wizardProcessor, VectorSearch vectorSearch){
        this.availableCommands = availableCommands;
        this.telegramClient = telegramClient;
        this.userSessionManager = userSessionManager;
        this.wizardManager = wizardManager;
        this.wizardProcessor = wizardProcessor;
        this.vectorSearch = vectorSearch;
    }

    public void processMessage(long chatId, String telegramUserId, String messageText) {
        if (messageText == null || messageText.isBlank()) { return; }
        
        UserSessionDTO userSession = userSessionManager.getOrCreateSession(telegramUserId);
        CommandContext context = new CommandContext(chatId, messageText, userSession);

        if (messageText.trim().equalsIgnoreCase("/cancel")) {
            return;
        }

        if (wizardManager.hasActiveDraft(chatId)) {
            wizardProcessor.processInput(context);
            return;
        }

        for (BotCommand command : availableCommands) {
            if (command.supports(messageText)) {
                command.execute(context);
                return;
            }
        }

        vectorSearch.execute(context);
        //BotHelper.sendHtmlMessageToTelegram(chatId, "I didn't recognize that command, type /start to see the menu.", telegramClient);
    }
    
}
