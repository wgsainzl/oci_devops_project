package com.springboot.telegrambot.wizard.state;

import com.springboot.telegrambot.command.CommandContext;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.wizard.TaskWizardManager;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class AwaitingTitleState implements WizardState {

    private final TelegramClient telegramClient;

    public AwaitingTitleState(TelegramClient telegramClient) {
        this.telegramClient = telegramClient;
    }

    @Override
    public TaskWizardManager.TaskCreationState getSupportedState() {
        return TaskWizardManager.TaskCreationState.AWAITING_TITLE;
    }

    @Override
    public void execute(CommandContext context, TaskWizardManager.TaskDraftSession session) {
        session.draftTask.setTitle(context.getMessageText());
        
        // Move the user to the next state
        session.state = TaskWizardManager.TaskCreationState.AWAITING_DESCRIPTION;
        
        BotHelper.sendHtmlMessageToTelegram(context.getChatId(), 
            "<b>Title saved.</b>\n\nNow, type the <b>Description</b>:", 
            telegramClient);
    }
}