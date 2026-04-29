import re

path = "MtdrSpring/telegram-bot/src/main/java/com/springboot/telegrambot/util/BotActions.java"
with open(path, "r") as f:
    content = f.read()

replacement = """    public void fnReport() {
        if (!requestText.startsWith(BotCommands.LLM_REPORT.getCommand()) || exit) return;
        
        // Expected format: /report <dev|manager> <id>
        String[] parts = requestText.split(" ");
        if (parts.length < 3) {
            BotHelper.sendMessageToTelegram(chatId, "Please specify role and ID. Example: /report dev 1  or  /report manager 1", telegramClient, null);
            return;
        }

        try {
            String role = parts[1].toLowerCase();
            Integer targetId = Integer.parseInt(parts[2]);
            
            if (role.equals("manager")) {
                BotHelper.sendMessageToTelegram(chatId, "⏳ Analyzing team activity logs for Manager...", telegramClient, null);
                
                // For a Manager, query the task logs and summarize recent activity
                List<Object[]> logs = backendServiceClient.getWeeklyTaskLogsSummary(targetId);
                String aiSummary = deepSeekService.generateLogsReport(targetId, logs);
                
                BotHelper.sendMessageToTelegram(chatId, "📊 **Manager Team Report**\\n\\n" + aiSummary, telegramClient, null);
                
            } else {
                BotHelper.sendMessageToTelegram(chatId, "⏳ Analyzing weekly tasks for Developer...", telegramClient, null);
                
                // For a Developer, query their specific task queue
                List<TaskDTO> devTasks = backendServiceClient.getWeeklySummaryTasks(targetId);
                String aiSummary = deepSeekService.generateSprintReport(targetId, devTasks);
                
                BotHelper.sendMessageToTelegram(chatId, "📊 **Developer Sprint Report**\\n\\n" + aiSummary, telegramClient, null);
            }
            
        } catch (NumberFormatException e) {
            BotHelper.sendMessageToTelegram(chatId, "Invalid ID format.", telegramClient, null);
        }
        exit = true;
    }"""

content = re.sub(r'public void fnReport\(\) \{.*?(?=public void fnElse)', replacement + "\n\n    ", content, flags=re.DOTALL)

with open(path, "w") as f:
    f.write(content)
