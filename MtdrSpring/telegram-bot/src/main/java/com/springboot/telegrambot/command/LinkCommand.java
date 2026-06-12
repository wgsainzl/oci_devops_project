package com.springboot.telegrambot.command;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import com.springboot.telegrambot.dto.TaskStatus;
import com.springboot.telegrambot.messaging.TaskRpcClient;
import com.springboot.telegrambot.util.BotCommands;
import com.springboot.telegrambot.util.BotHelper;
import com.springboot.telegrambot.util.BotLabels;
import org.springframework.stereotype.Component;

@Component
public class LinkCommand implements BotCommand {
    private static final Logger logger = LoggerFactory.getLogger(ListTasksCommand.class);
    private final TelegramClient telegramClient;
    private final TaskRpcClient taskRpcClient;

    public LinkCommand(TelegramClient telegramClient, TaskRpcClient taskRpcClient) {
        this.telegramClient = telegramClient;
        this.taskRpcClient = taskRpcClient;
    }

    @Override
    public boolean supports(String messageText) {
    System.out.println("DEBUG BOT MSG: '" + messageText + "'");
    if (messageText == null || messageText.isBlank()) {
        return false;
    }
    
    String text = messageText.trim().toLowerCase();
    String command = BotCommands.LINK.getCommand().toLowerCase();
    
    // Checks if it starts with "/link " (with space) or exactly matches "/link"
    // OR matches group format "/link@yourbot"
    return text.equals(command) || 
           text.startsWith(command + " ") || 
           text.startsWith(command + "@");
}

    @Override
    public void execute(CommandContext context){
        long chatId = context.getChatId();
        String[] parts = context.getMessageText().trim().split("\\s+");
        if (parts.length !=2){
            BotHelper.sendHtmlMessageToTelegram(chatId, "\"<b>Invalid format.</b>\nUse: <code>/link &lt;CODE&gt;</code>. Get the code form the WebApp", telegramClient);
            return;
        }
    

        try {
            Integer code = Integer.parseInt(parts[1]);
            if (taskRpcClient.linkTelegramId(context.getUserSession().getTelegramUserId(), code)){
                BotHelper.sendHtmlMessageToTelegram(chatId, "<b>Telegarm linked successfuly!</b>", telegramClient);
            } else {
               BotHelper.sendHtmlMessageToTelegram(chatId, "<b>Something went wrong, please try again later</b>", telegramClient); 
            }
        } catch (Exception e){
            logger.error("Error linking account", e);
        }
    }
    
}
