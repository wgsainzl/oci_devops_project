package com.springboot.telegrambot.wizard.state;

import com.springboot.telegrambot.command.CommandContext;
import com.springboot.telegrambot.wizard.TaskWizardManager;

public interface WizardState {
    // Tells the processor WHICH state this class handles
    TaskWizardManager.TaskCreationState getSupportedState();
    
    // Executes the logic for this specific step
    void execute(CommandContext context, TaskWizardManager.TaskDraftSession session);
}