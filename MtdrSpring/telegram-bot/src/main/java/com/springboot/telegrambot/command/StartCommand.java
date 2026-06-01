package com.springboot.telegrambot.command;

import com.springboot.telegrambot.util.BotCommands;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.util.BotLabels;
import com.springboot.telegrambot.util.BotMessages;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.ArrayList;
import java.util.List;

@Component
public class StartCommand implements BotCommand {

    private final TelegramClient telegramClient;

    public StartCommand(TelegramClient telegramClient) {
        this.telegramClient = telegramClient;
    }

    @Override
    public boolean supports(String messageText) {
        String text = messageText.trim();
        return text.equals(BotCommands.START_COMMAND.getCommand()) || 
               text.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel());
    }

    @Override
    public void execute(CommandContext context) {
        long chatId = context.getChatId();

        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow row1 = new KeyboardRow();
        row1.add(BotLabels.LIST_ALL_ITEMS.getLabel());
        row1.add(BotLabels.ADD_NEW_ITEM.getLabel());
        keyboard.add(row1);

        KeyboardRow row2 = new KeyboardRow();
        row2.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        row2.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());
        keyboard.add(row2);

        KeyboardRow row3 = new KeyboardRow();
        row3.add(BotLabels.GENERATE_REPORT.getLabel());
        keyboard.add(row3);

        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
                .keyboard(keyboard)
                .resizeKeyboard(true)
                .build();

        BotHelper.sendMessageToTelegram(
                chatId, 
                BotMessages.HELLO_MYTODO_BOT.getMessage(), 
                telegramClient, 
                keyboardMarkup
        );
    }
}