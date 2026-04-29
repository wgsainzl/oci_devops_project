package com.springboot.MyTodoList.web.features.task;

import com.springboot.MyTodoList.web.config.BotProps;
import com.springboot.MyTodoList.web.features.deepseek.DeepSeekService;
import com.springboot.MyTodoList.web.util.BotActions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
import org.telegram.telegrambots.longpolling.BotSession;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.AfterBotRegistration;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class ToDoItemBotController implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
    
    // Updated variable name for clarity
    private TaskService taskService; 
    private DeepSeekService deepSeekService;
    private final TelegramClient telegramClient;
    
    private final BotProps botProps;

    @Value("${telegram.bot.token}")
    private String telegramBotToken;

    @Override
    public String getBotToken() {
        if(telegramBotToken != null && !telegramBotToken.trim().isEmpty()){
            return telegramBotToken;
        }else{
            return botProps.getToken();
        }
    }

    public ToDoItemBotController(BotProps bp, TaskService tsvc, DeepSeekService ds) {
        this.botProps = bp;
        this.telegramClient = new OkHttpTelegramClient(getBotToken());
        this.taskService = tsvc;
        this.deepSeekService = ds;
    }

    @Override
    public LongPollingUpdateConsumer getUpdatesConsumer() {
        return this;
    }

    @Override
    public void consume(Update update) {

        if (!update.hasMessage() || !update.getMessage().hasText()) return;

        String messageTextFromTelegram = update.getMessage().getText();
        long chatId = update.getMessage().getChatId();

        BotActions actions = new BotActions(telegramClient, taskService, deepSeekService);
        actions.setRequestText(messageTextFromTelegram);
        actions.setChatId(chatId);
        
        if(actions.getTaskService() == null){
            logger.info("taskService error");
            // FIXED: Updated to match the new setter in BotActions
            actions.setTaskService(taskService); 
        }

        actions.fnStart();
        actions.fnDone();
        // FIXED: Swapped fnUndo for the new fnBlock
        actions.fnBlock(); 
        actions.fnDelete();
        actions.fnListAll();
        actions.fnAddItem();
        // FIXED: Swapped fnLLM for the new fnReport
        actions.fnReport(); 
        actions.fnElse();

    }

    @AfterBotRegistration
    public void afterRegistration(BotSession botSession) {
        System.out.println("Registered bot running state is: " + botSession.isRunning());
    }
}