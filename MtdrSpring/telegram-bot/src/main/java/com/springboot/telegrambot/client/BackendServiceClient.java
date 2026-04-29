package com.springboot.telegrambot.client;

import com.springboot.telegrambot.dto.TaskDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
public class BackendServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(BackendServiceClient.class);
    private final WebClient webClient;

    public BackendServiceClient(@Value("${backend.url:http://localhost:8080}") String backendUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(backendUrl)
                .build();
    }

    public List<TaskDTO> findAllTasks() {
        return webClient.get()
                .uri("/tasks")
                .retrieve()
                .bodyToFlux(TaskDTO.class)
                .collectList()
                .block();
    }

    public Map<String, Object> getUserRoleByTelegramId(String telegramId) {
        return webClient.get()
                .uri("/api/users/telegram/" + telegramId + "/role")
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }

    public List<TaskDTO> getWeeklySummaryTasks(Integer userId, OffsetDateTime weekStart, OffsetDateTime weekEnd) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tasks/summary/{userId}")
                        .queryParam("weekStart", weekStart)
                        .queryParam("weekEnd", weekEnd)
                        .build(userId))
                .retrieve()
                .bodyToFlux(TaskDTO.class)
                .collectList()
                .block();
    }

    public List<Object[]> getWeeklyTaskLogsSummary(Integer userId) {
        return webClient.get()
                .uri("/dashboard/summary/" + userId)
                .retrieve()
                .bodyToFlux(Object[].class)
                .collectList()
                .block();
    }

    public TaskDTO createTask(TaskDTO task) {
        return webClient.post()
                .uri("/tasks")
                .bodyValue(task)
                .retrieve()
                .bodyToMono(TaskDTO.class)
                .block();
    }

    public void updateTaskStatus(Integer id, String status) {
        // Construct the request body as expected by the backend
        var body = Map.of("status", status);
        webClient.patch()
                .uri("/tasks/" + id + "/status")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    public void deleteTask(Integer id) {
        webClient.delete()
                .uri("/tasks/" + id)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    public Long createSummaryJobPending(String telegramUserId, OffsetDateTime weekStart, OffsetDateTime weekEnd) {
        Map<String, Object> body = Map.of(
                "telegramUserId", telegramUserId,
                "weekStart", weekStart,
                "weekEnd", weekEnd
        );

        Map<String, Object> response = webClient.post()
                .uri("/summary-jobs")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || response.get("jobId") == null) {
            throw new IllegalStateException("Backend did not return a summary job id.");
        }
        return Long.valueOf(response.get("jobId").toString());
    }

    public void markSummaryJobProcessing(Long jobId) {
        webClient.patch()
                .uri("/summary-jobs/" + jobId + "/processing")
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    public void markSummaryJobSent(Long jobId, String generatedSummary) {
        Map<String, Object> body = Map.of("generatedSummary", generatedSummary);
        webClient.patch()
                .uri("/summary-jobs/" + jobId + "/sent")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    public void markSummaryJobFailed(Long jobId, String errorMessage) {
        Map<String, Object> body = Map.of("errorMessage", errorMessage == null ? "Unknown error" : errorMessage);
        webClient.patch()
                .uri("/summary-jobs/" + jobId + "/failed")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }
    // --- NEW: Fetch all sprints ---
    public List<com.springboot.telegrambot.dto.SprintDTO> getAllSprints() {
        logger.info("=====================================================");
        logger.info("--> BOT FIRING REQUEST TO: /sprints");
        
        try {
            // 1. Fetch the raw payload just to log it
            String rawResponse = webClient.get()
                    .uri("/sprints")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            logger.info("<-- RAW PAYLOAD RECEIVED FROM BACKEND:");
            logger.info(rawResponse);
            logger.info("=====================================================");
        } catch (Exception e) {
            logger.error("<-- WEBCLIENT CRASHED EXECUTING /sprints: {}", e.getMessage());
            logger.info("=====================================================");
        }

        // 2. Do the actual mapping
        return webClient.get()
                .uri("/sprints")
                .retrieve()
                .bodyToFlux(com.springboot.telegrambot.dto.SprintDTO.class)
                .collectList()
                .block();
    }

    public List<TaskDTO> getTasksForSprint(Integer sprintId) {
        return webClient.get()
                .uri("/sprints/" + sprintId + "/tasks")
                .retrieve()
                .bodyToFlux(TaskDTO.class)
                .collectList()
                .block();
    }

    public TaskDTO createTaskFromTelegram(TaskDTO task, String telegramId) {
        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/tasks/telegram")
                        .queryParam("telegramId", telegramId)
                        .build())
                .bodyValue(task)
                .retrieve()
                .bodyToMono(TaskDTO.class)
                .block();
    }
}
