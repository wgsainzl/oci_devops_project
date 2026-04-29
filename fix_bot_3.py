import re

path = "MtdrSpring/telegram-bot/src/main/java/com/springboot/telegrambot/deepseek/DeepSeekService.java"
with open(path, "r") as f:
    content = f.read()

content = content.replace("org.json.JSONObject js = new org.json.JSONObject(response);", "com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response);")
content = content.replace("return js.getJSONArray(\"choices\").getJSONObject(0).getJSONObject(\"message\").getString(\"content\");", "return root.path(\"choices\").get(0).path(\"message\").path(\"content\").asText();")
content = content.replace("userMsg.role(\"user\");", "userMsg.put(\"role\", \"user\");")

with open(path, "w") as f:
    f.write(content)

