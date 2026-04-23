import re
import os

def fix_bot_actions():
    path = "MtdrSpring/telegram-bot/src/main/java/com/springboot/telegrambot/util/BotActions.java"
    with open(path, "r") as f:
        content = f.read()

    # KeyboardRow issue
    content = content.replace(
        "new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.ADD_NEW_ITEM.getLabel())",
        "new KeyboardRow(java.util.List.of(new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.LIST_ALL_ITEMS.getLabel()), new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.ADD_NEW_ITEM.getLabel())))"
    )
    content = content.replace(
        "new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel())",
        "new KeyboardRow(java.util.List.of(new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.SHOW_MAIN_SCREEN.getLabel()), new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton(BotLabels.HIDE_MAIN_SCREEN.getLabel())))"
    )

    # Method fixes
    content = content.replace("backendServiceClient.findAll();", "backendServiceClient.findAllTasks();")
    content = content.replace("backendServiceClient.getTasksByUserId(targetUserId);", "backendServiceClient.getWeeklySummaryTasks(targetUserId);")
    content = content.replace("TaskDTO newTask = new Task();", "TaskDTO newTask = new TaskDTO();")
    content = content.replace("public void setTaskService", "public void setBackendServiceClient")
    content = content.replace("public BackendServiceClient getTaskService()", "public BackendServiceClient getBackendServiceClient()")
    
    with open(path, "w") as f:
        f.write(content)

def fix_deepseek_service():
    path = "MtdrSpring/telegram-bot/src/main/java/com/springboot/telegrambot/deepseek/DeepSeekService.java"
    # Overwrite the file completely with a WebClient implementation!
    content = """package com.springboot.telegrambot.deepseek;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.springboot.telegrambot.config.DeepSeekConfig;
import com.springboot.telegrambot.dto.TaskDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class DeepSeekService {

    private static final Logger logger = LoggerFactory.getLogger(DeepSeekService.class);
    
    @Autowired
    private DeepSeekConfig deepSeekConfig;

    @Autowired
    private WebClient webClient; // Assuming a general WebClient bean or we can construct it

    private final ObjectMapper mapper = new ObjectMapper();

    public String generateSprintReport(Integer userId, List<TaskDTO> tasks) {
        try {
            // Pre-process tasks to send slightly less context
            StringBuilder tasksSummary = new StringBuilder();
            for (TaskDTO t : tasks) {
                tasksSummary.append("- [")
                            .append(t.getStatus() != null ? t.getStatus() : "TODO")
                            .append("] ")
                            .append(t.getTitle())
                            .append("\\n");
            }
            
            String prompt = "You are an Agile Sprint Reporter. The following is a list of tasks for the developer " 
                          + "with ID " + userId + " for the past week. Please write a short, encouraging summary of their progress.\\n\\n"
                          + "Tasks:\\n" + tasksSummary.toString();

            // Construct payload
            ObjectNode payload = mapper.createObjectNode();
            payload.put("model", "deepseek-chat");

            ArrayNode messages = payload.putArray("messages");
            ObjectNode systemMsg = mapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are a helpful assistant.");
            messages.add(systemMsg);

            ObjectNode userMsg = mapper.createObjectNode();
            userMsg.role("user");
            userMsg.put("content", prompt);
            messages.add(userMsg);

            payload.put("temperature", 0.7);

            // Make request
            String response = WebClient.builder().baseUrl(deepSeekConfig.getApiUrl()).build()
                    .post()
                    .header("Authorization", "Bearer " + deepSeekConfig.getApiKey())
                    .header("Content-Type", "application/json")
                    .bodyValue(mapper.writeValueAsString(payload))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
                    
            if(response != null) {
                org.json.JSONObject js = new org.json.JSONObject(response);
                return js.getJSONArray("choices").getJSONObject(0).getJSONObject("message").getString("content");
            }

            return "Summary failed.";
        } catch (Exception e) {
            logger.error("Deepseek Error: ", e);
            return "Error contacting DeepSeek AI.";
        }
    }
}
"""
    with open(path, "w") as f:
        f.write(content)


def fix_deepseek_config():
    path = "MtdrSpring/telegram-bot/src/main/java/com/springboot/telegrambot/config/DeepSeekConfig.java"
    content = """package com.springboot.telegrambot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DeepSeekConfig {

    @Value("${deepseek.api.key}")
    private String apiKey;

    @Value("${deepseek.api.url}")
    private String apiUrl;

    public String getApiKey() {
        return apiKey;
    }

    public String getApiUrl() {
        return apiUrl;
    }
}
"""
    with open(path, "w") as f:
        f.write(content)

fix_bot_actions()
fix_deepseek_service()
fix_deepseek_config()

