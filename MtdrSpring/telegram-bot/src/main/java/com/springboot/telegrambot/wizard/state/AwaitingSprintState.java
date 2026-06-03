package com.springboot.telegrambot.wizard.state;

import com.springboot.telegrambot.command.CommandContext;
import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.dto.TaskStatus;
import com.springboot.telegrambot.messaging.TaskCommandPublisher;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.wizard.TaskWizardManager;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class AwaitingSprintState implements WizardState {

    private final TelegramClient telegramClient;
    private final TaskCommandPublisher taskCommandPublisher;
    private final TaskWizardManager wizardManager;

    public AwaitingSprintState(TelegramClient telegramClient, TaskCommandPublisher taskCommandPublisher, TaskWizardManager wizardManager) {
        this.telegramClient = telegramClient;
        this.taskCommandPublisher = taskCommandPublisher;
        this.wizardManager = wizardManager;
    }

    @Override
    public TaskWizardManager.TaskCreationState getSupportedState() {
        return TaskWizardManager.TaskCreationState.AWAITING_SPRINT;
    }

    @Override
    public void execute(CommandContext context, TaskWizardManager.TaskDraftSession session) {
        long chatId = context.getChatId();
        int sprintId;
        
        try {
            sprintId = Integer.parseInt(context.getMessageText());
        } catch (NumberFormatException ex) {
            BotHelper.sendMessageToTelegram(chatId, "Please click one of the Sprint numbers, or type 0 to skip.", telegramClient);
            return; 
        }
        
        if (sprintId > 0) {
            TaskDTO.SprintReference sprintRef = new TaskDTO.SprintReference();
            sprintRef.setSprintId(sprintId);
            session.draftTask.setSprint(sprintRef);
        }
        
        session.draftTask.setStatus(TaskStatus.TODO);
        
        try {
            taskCommandPublisher.createTask(session.draftTask, String.valueOf(chatId));
            wizardManager.clearDraft(chatId); // Clean up the session!
            BotHelper.sendHtmlMessageToTelegram(chatId, "<b>Task submitted!</b>\nIt will appear on your board shortly. Type /tasks to check.", telegramClient);
        } catch (Exception ex) {
            BotHelper.sendHtmlMessageToTelegram(chatId, "<b>Task submission failed:</b> Please try again in a moment.", telegramClient);
        }
    }
}