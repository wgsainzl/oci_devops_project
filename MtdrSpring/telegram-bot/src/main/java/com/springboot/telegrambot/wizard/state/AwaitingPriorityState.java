package com.springboot.telegrambot.wizard.state;

import com.springboot.telegrambot.command.CommandContext;
import com.springboot.telegrambot.dto.SprintDTO;
import com.springboot.telegrambot.messaging.TaskRpcClient;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.wizard.TaskWizardManager;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.ArrayList;
import java.util.List;

@Component
public class AwaitingPriorityState implements WizardState {

    private final TelegramClient telegramClient;
    private final TaskRpcClient taskRpcClient;

    public AwaitingPriorityState(TelegramClient telegramClient, TaskRpcClient taskRpcClient) {
        this.telegramClient = telegramClient;
        this.taskRpcClient = taskRpcClient;
    }

    @Override
    public TaskWizardManager.TaskCreationState getSupportedState() {
        return TaskWizardManager.TaskCreationState.AWAITING_PRIORITY;
    }

    @Override
    public void execute(CommandContext context, TaskWizardManager.TaskDraftSession session) {
        session.draftTask.setPriority(context.getMessageText().toUpperCase());
        session.state = TaskWizardManager.TaskCreationState.AWAITING_SPRINT;

        List<SprintDTO> sprints = taskRpcClient.getAllSprints();
        List<String> sprintButtons = new ArrayList<>();
        sprintButtons.add("0"); // Skip option
        
        StringBuilder sprintMsg = new StringBuilder("<b>Priority saved.</b>\n\nFinally, select the <b>Sprint ID</b> this belongs to:\n\n");
        
        if (sprints != null && !sprints.isEmpty()) {
            for (SprintDTO s : sprints) {
                sprintButtons.add(String.valueOf(s.getId()));
                String sprintName = s.getName() != null ? s.getName() : "Unnamed Sprint";
                sprintMsg.append("• <b>").append(s.getId()).append("</b> - ").append(sprintName).append("\n");
            }
        } else {
            sprintMsg.append("<i>(No active sprints found. Click 0 to skip).</i>");
        }

        BotHelper.sendHtmlMessageWithKeyboard(context.getChatId(), sprintMsg.toString(), telegramClient, BotHelper.createKeyboard(sprintButtons));
    }
}