package com.springboot.telegrambot.deepseek;

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
                            .append("\n");
            }
            
            String prompt = "You are an Agile Sprint Reporter. The following is a list of tasks for developer ID "
                          + userId + ". Return ONLY markdown content that can be saved as a .md weekly report file.\n"
                          + "Use this structure:\n"
                          + "# Weekly Summary\n"
                          + "## Highlights\n"
                          + "## Risks\n"
                          + "## Next Steps\n\n"
                          + "Tasks:\n" + tasksSummary;

            // Construct payload
            ObjectNode payload = mapper.createObjectNode();
            payload.put("model", deepSeekConfig.getModel());

            ArrayNode messages = payload.putArray("messages");
            ObjectNode systemMsg = mapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are a helpful assistant.");
            messages.add(systemMsg);

            ObjectNode userMsg = mapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", prompt);
            messages.add(userMsg);

            payload.put("temperature", 0.7);

            // Make request
            String response = withOptionalAuth(webClient.post()
                    .uri(deepSeekConfig.getApiUrl()))
                    .header("Content-Type", "application/json")
                    .bodyValue(mapper.writeValueAsString(payload))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
                    
            if(response != null) {
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response);
                return root.path("choices").get(0).path("message").path("content").asText();
            }

            return "Summary failed.";
        } catch (Exception e) {
            logger.error("Deepseek Error: ", e);
            return "Error contacting DeepSeek AI.";
        }
    }

    public String generateLogsReport(Integer managerId, List<Object[]> logs) {
        try {
            StringBuilder logsSummary = new StringBuilder();
            for (Object[] log : logs) {
                logsSummary.append("- Task: ").append(log[1])
                            .append(", Field: ").append(log[2])
                            .append(", Changed from '").append(log[3])
                            .append("' to '").append(log[4])
                            .append("'\n");
            }
            
            String prompt = "You are an Agile Manager Assistant. The following is a list of weekly task changes (logs) for your team. Please write a short, executive summary of the team's activity.\n\n"
                          + "Logs:\n" + logsSummary.toString();

            ObjectNode payload = mapper.createObjectNode();
            payload.put("model", deepSeekConfig.getModel());

            ArrayNode messages = payload.putArray("messages");
            ObjectNode systemMsg = mapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are a helpful management assistant.");
            messages.add(systemMsg);

            ObjectNode userMsg = mapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", prompt);
            messages.add(userMsg);

            payload.put("temperature", 0.7);

            String response = withOptionalAuth(webClient.post()
                    .uri(deepSeekConfig.getApiUrl()))
                    .header("Content-Type", "application/json")
                    .bodyValue(mapper.writeValueAsString(payload))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
                    
            if(response != null) {
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response);
                return root.path("choices").get(0).path("message").path("content").asText();
            }
            return "Summary failed.";
        } catch (Exception e) {
            logger.error("Deepseek Error: ", e);
            return "Error contacting DeepSeek AI.";
        }
    }

    private WebClient.RequestBodySpec withOptionalAuth(WebClient.RequestBodySpec request) {
        String apiKey = deepSeekConfig.getApiKey();
        if (apiKey != null && !apiKey.isBlank() && !"dummy".equalsIgnoreCase(apiKey)) {
            return request.header("Authorization", "Bearer " + apiKey);
        }
        return request;
    }
}
