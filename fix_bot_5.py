import re

path = "MtdrSpring/telegram-bot/src/main/java/com/springboot/telegrambot/deepseek/DeepSeekService.java"
with open(path, "r") as f:
    content = f.read()

replacement = """    public String generateLogsReport(Integer managerId, List<Object[]> logs) {
        try {
            StringBuilder logsSummary = new StringBuilder();
            for (Object[] log : logs) {
                logsSummary.append("- Task: ").append(log[1])
                            .append(", Field: ").append(log[2])
                            .append(", Changed from '").append(log[3])
                            .append("' to '").append(log[4])
                            .append("'\\n");
            }
            
            String prompt = "You are an Agile Manager Assistant. The following is a list of weekly task changes (logs) for your team. Please write a short, executive summary of the team's activity.\\n\\n"
                          + "Logs:\\n" + logsSummary.toString();

            ObjectNode payload = mapper.createObjectNode();
            payload.put("model", "deepseek-chat");

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

            String response = webClient.post()
                    .uri(deepSeekConfig.getApiUrl())
                    .header("Authorization", "Bearer " + deepSeekConfig.getApiKey())
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
}"""

content = content.replace("}\n}", "}\n\n" + replacement)

with open(path, "w") as f:
    f.write(content)
