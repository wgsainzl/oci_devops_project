package com.springboot.telegrambot.wizard.state;

import com.springboot.telegrambot.command.CommandContext;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.wizard.TaskWizardManager;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;
import java.util.List;

@Component
public class AwaitingEstimatedHours implements WizardState {

    private final TelegramClient telegramClient;

    public AwaitingEstimatedHours(TelegramClient telegramClient) {
        this.telegramClient = telegramClient;
    }

    @Override
    public TaskWizardManager.TaskCreationState getSupportedState() {
        return TaskWizardManager.TaskCreationState.AWAITING_ESTIMATED_HOURS;
    }

    @Override
    public void execute(CommandContext context, TaskWizardManager.TaskDraftSession session) {
        String text = context.getMessageText();
        try {
            double actualHours = Double.parseDouble(text);
            session.draftTask.setActualHours(actualHours);
            session.state = TaskWizardManager.TaskCreationState.AWAITING_PRIORITY;

            BotHelper.sendHtmlMessageWithKeyboard(context.getChatId(), 
                "<b>Description saved.</b>\n\nPlease select the <b>Priority</b> below:", 
                telegramClient, 
                BotHelper.createKeyboard(List.of("HIGH", "MEDIUM", "LOW")));

        } catch (NumberFormatException e){
            BotHelper.sendHtmlMessageToTelegram(context.getChatId(), "<b>Message is not a number:</b> Please try again.", telegramClient);
        }
    }
}