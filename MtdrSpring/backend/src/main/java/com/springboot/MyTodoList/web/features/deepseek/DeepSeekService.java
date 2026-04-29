package com.springboot.MyTodoList.web.features.deepseek;

import com.springboot.MyTodoList.web.features.task.Task;

import java.io.IOException;
import java.util.List;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.web.features.task.Task;

@Service
public class DeepSeekService{
    private final CloseableHttpClient httpClient;
    private final HttpPost httpPost;

    public DeepSeekService(CloseableHttpClient httpClient, HttpPost httpPost) {
        this.httpClient = httpClient;
        this.httpPost = httpPost;
    }

    // New Method: Dynamically builds the RAG prompt based on user tasks
    public String generateSprintReport(Integer userId, List<Task> tasks) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a brief, professional 1-on-1 sprint report for Developer ID ").append(userId).append(". ");
        prompt.append("Summarize their progress and highlight any bottlenecks based on the following tasks:\\n");
        
        for(Task t : tasks) {
            String status = t.getStatus() != null ? t.getStatus().name() : "TODO";
            prompt.append("- [").append(status).append("] ").append(t.getTitle()).append(": ").append(t.getDescription()).append("\\n");
        }

        String requestBody = String.format("{\"model\": \"deepseek-chat\",\"messages\": [{\"role\": \"user\", \"content\": \"%s\"}]}", prompt.toString());

        try {
            httpPost.setEntity(new StringEntity(requestBody));
            CloseableHttpResponse response = httpClient.execute(httpPost);
            return EntityUtils.toString(response.getEntity());
        } catch (Exception e) {
            // REQ-FUN-013: Graceful fallback on AI failure
            return "AI Service is temporarily unavailable or timed out. Please try your report request again later.";
        }
    }
}