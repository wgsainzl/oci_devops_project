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
                          + userId + ". Return ONLY markdown content that can be saved as a .md monthly report file.\n"
                          + "Use this structure:\n"
                          + "# Monthly Summary\n"
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

    public String generateLogsReport(Integer managerId, List<List<String>> logs) {
        try {
            if (logs == null || logs.isEmpty()) {
                return "There is no recorded activity in the selected timeframe.";
            }

            StringBuilder logsSummary = new StringBuilder();

            for (List<String> log : logs) {
                if (log != null && log.size() >= 5) {
                    String taskName  = log.get(1) != null ? log.get(1) : "Unknown Task";
                    String fieldName = log.get(2) != null ? log.get(2) : "Unknown Field";
                    String oldValue  = log.get(3) != null ? log.get(3) : "None";
                    String newValue  = log.get(4) != null ? log.get(4) : "None";

                    logsSummary.append("- Task: '").append(taskName)
                            .append("', Changed Field: '").append(fieldName)
                            .append("', From '").append(oldValue)
                            .append("' -> To '").append(newValue)
                            .append("'\n");
                }
            }

            if (logsSummary.length() == 0) {
                return "There is no recorded activity in the selected timeframe.";
            }

            String prompt = "You are an Agile Manager Assistant. The following is a list of recent task status changes (audit logs) for your development team.\n\n"
                    + "Logs:\n" + logsSummary.toString() + "\n\n"
                    + "Analyze these logs and generate a structured summary using exactly this format:\n"
                    + "* **Velocity Overview:** A high-level look at the volume of work completed vs. work remaining based on the status changes.\n"
                    + "* **Key Deliverables:** Significant features or tasks that transitioned to 'DONE'.\n"
                    + "* **Blockers & Risks:** Any tasks that are currently stalled, moved to 'BLOCKED', or regressed.\n"
                    + "* **Workflow Trends:** Observations on process bottlenecks or where the team is spending most of their time.";

            return callGeminiApi(prompt);

        } catch (Exception e) {
            logger.error("Error generating Gemini AI Report: ", e);
            return "Error contacting Gemini AI to generate the report. Please try again later.";
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
                
        if (response != null) {
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        }

        return "Summary failed.";
    }
}