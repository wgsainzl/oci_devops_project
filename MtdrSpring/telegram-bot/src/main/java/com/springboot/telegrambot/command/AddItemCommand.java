package com.springboot.telegrambot.command;

import com.springboot.telegrambot.util.BotCommands;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.util.BotLabels;
import com.springboot.telegrambot.wizard.TaskWizardManager;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class AddItemCommand implements BotCommand {

    private final TelegramClient telegramClient;
    private final TaskWizardManager wizardManager;

    public AddItemCommand(TelegramClient telegramClient, TaskWizardManager wizardManager) {
        this.telegramClient = telegramClient;
        this.wizardManager = wizardManager;
    }

    @Override
    public boolean supports(String messageText) {
        String text = messageText.trim();
        return text.contains(BotCommands.ADD_ITEM.getCommand()) || 
               text.contains(BotLabels.ADD_NEW_ITEM.getLabel());
    }

    @Override
    public void execute(CommandContext context) {
        long chatId = context.getChatId();
        
        wizardManager.startDraft(chatId);
        
        BotHelper.sendHtmlMessageToTelegram(chatId, 
            "🛠️ <b>Let's create a new task!</b>\n<i>(You can type /cancel at any time to stop).</i>\n\nFirst, what is the <b>Title</b> of the task?", 
            telegramClient);
    }
}