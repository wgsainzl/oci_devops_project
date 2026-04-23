package com.springboot.telegrambot.util;

public enum BotMessages {
    
    HELLO_MYTODO_BOT(
    "Hello! I'm your DevOps TaskDTO Bot!\nType a new task description below and press the send button, or select an option below:"),
    
    BOT_REGISTERED_STARTED("Bot registered and started successfully!"),
    
    ITEM_DONE("TaskDTO marked as DONE! Select /tasks to return to your active list, or /start to go to the main screen."), 
    
    ITEM_BLOCKED("TaskDTO flagged as BLOCKED! Your manager has been notified. Select /tasks to return to your active list."), 
    
    ITEM_DELETED("TaskDTO deleted! Select /tasks to return to your active list, or /start to go to the main screen."),
    
    TYPE_NEW_TODO_ITEM("Type a new task description below and press the send button (blue arrow) on the right-hand side."),
    
    NEW_ITEM_ADDED("New task added! Select /tasks to return to your active list, or /start to go to the main screen."),
    
    BYE("Bye! Select /start to resume!");

    private String message;

    BotMessages(String enumMessage) {
        this.message = enumMessage;
    }

    public String getMessage() {
        return message;
    }
}