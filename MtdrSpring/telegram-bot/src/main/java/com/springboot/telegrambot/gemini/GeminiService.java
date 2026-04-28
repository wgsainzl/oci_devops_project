package com.springboot.telegrambot.gemini;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.springboot.telegrambot.config.GeminiConfig;
import com.springboot.telegrambot.dto.TaskDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    
    @Autowired
    private GeminiConfig geminiConfig;

    @Autowired
    private WebClient webClient;

    private final ObjectMapper mapper = new ObjectMapper();

    public String generateSprintReport(Integer userId, List<TaskDTO> tasks) {
        try {
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

            return callGeminiApi(prompt);
        } catch (Exception e) {
            logger.error("Gemini Error: ", e);
            return "Error contacting Gemini AI.";
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

            return callGeminiApi(prompt);
        } catch (Exception e) {
            logger.error("Gemini Error: ", e);
            return "Error contacting Gemini AI.";
        }
    }

    private String callGeminiApi(String prompt) throws Exception {
        ObjectNode payload = mapper.createObjectNode();
        ArrayNode contents = payload.putArray("contents");
        
        ObjectNode contentNode = mapper.createObjectNode();
        ArrayNode parts = contentNode.putArray("parts");
        
        ObjectNode partNode = mapper.createObjectNode();
        partNode.put("text", prompt);
        parts.add(partNode);
        contents.add(contentNode);

        String response = webClient.post()
                .uri(geminiConfig.getApiUrl())
                .header("Content-Type", "application/json")
                .header("X-goog-api-key", geminiConfig.getApiKey())
                .bodyValue(mapper.writeValueAsString(payload))
                .retrieve()
                .bodyToMono(String.class)
                .block();
                
        if(response != null) {
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        }

        return "Summary failed.";
    }
}
