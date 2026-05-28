package com.springboot.telegrambot.wizard.state;

import com.springboot.telegrambot.command.CommandContext;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.wizard.TaskWizardManager;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;
import java.util.List;

@Component
public class AwaitingDescriptionState implements WizardState {

    private final TelegramClient telegramClient;

    public AwaitingDescriptionState(TelegramClient telegramClient) {
        this.telegramClient = telegramClient;
    }

    @Override
    public TaskWizardManager.TaskCreationState getSupportedState() {
        return TaskWizardManager.TaskCreationState.AWAITING_DESCRIPTION;
    }

    @Override
    public void execute(CommandContext context, TaskWizardManager.TaskDraftSession session) {
        session.draftTask.setDescription(context.getMessageText());
        session.state = TaskWizardManager.TaskCreationState.AWAITING_PRIORITY;
        
        BotHelper.sendHtmlMessageWithKeyboard(context.getChatId(), 
            "<b>Description saved.</b>\n\nPlease select the <b>Priority</b> below:", 
            telegramClient, 
            BotHelper.createKeyboard(List.of("HIGH", "MEDIUM", "LOW")));
    }
}