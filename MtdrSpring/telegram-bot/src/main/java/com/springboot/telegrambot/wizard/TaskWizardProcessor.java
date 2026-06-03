package com.springboot.telegrambot.wizard;

import com.springboot.telegrambot.command.CommandContext;
import com.springboot.telegrambot.wizard.state.WizardState;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TaskWizardProcessor {

    private final TaskWizardManager wizardManager;
    private final Map<TaskWizardManager.TaskCreationState, WizardState> stateHandlers;

    // Spring magically injects all classes that implement WizardState!
    public TaskWizardProcessor(TaskWizardManager wizardManager, List<WizardState> states) {
        this.wizardManager = wizardManager;
        
        // Convert the list of states into a fast lookup map
        this.stateHandlers = states.stream()
                .collect(Collectors.toMap(WizardState::getSupportedState, Function.identity()));
    }

    public void processInput(CommandContext context) {
        long chatId = context.getChatId();
        TaskWizardManager.TaskDraftSession session = wizardManager.getDraft(chatId);

        if (session == null) return;

        // Find the specific class for the user's current step and execute it
        WizardState handler = stateHandlers.get(session.state);
        if (handler != null) {
            handler.execute(context, session);
        }
    }
}