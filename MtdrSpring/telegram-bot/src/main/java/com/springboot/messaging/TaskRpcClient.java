package com.springboot.telegrambot.messaging;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.telegrambot.config.RabbitMQConfig;
import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.messaging.dto.TaskRpcRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TaskRpcClient {

    private static final Logger logger = LoggerFactory.getLogger(TaskRpcClient.class);
    private static final long TIMEOUT_MS = 5000;

    @Autowired private RabbitTemplate rabbitTemplate;
    @Autowired private ObjectMapper objectMapper;

    public List<TaskDTO> getAllTasks() {
        TaskRpcRequest request = new TaskRpcRequest();
        request.setQueryType(TaskRpcRequest.QueryType.GET_ALL_TASKS);
        request.setCorrelationId(UUID.randomUUID().toString());
        request.setReplyTo(RabbitMQConfig.RK_TASK_RPC_REPLY);

        Object response = rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.RK_TASK_RPC_REQ,
                request
        );

        return parseTaskList(response);
    }

    public List<TaskDTO> getTasksForSprint(Integer sprintId) {
        TaskRpcRequest request = new TaskRpcRequest();
        request.setQueryType(TaskRpcRequest.QueryType.GET_TASKS_FOR_SPRINT);
        request.setSprintId(sprintId);
        request.setCorrelationId(UUID.randomUUID().toString());
        request.setReplyTo(RabbitMQConfig.RK_TASK_RPC_REPLY);

        Object response = rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.RK_TASK_RPC_REQ,
                request
        );

        return parseTaskList(response);
    }

    public Map<String, Object> getUserRole(String telegramId) {
        TaskRpcRequest request = new TaskRpcRequest();
        request.setQueryType(TaskRpcRequest.QueryType.GET_USER_ROLE);
        request.setTelegramId(telegramId);
        request.setCorrelationId(UUID.randomUUID().toString());
        request.setReplyTo(RabbitMQConfig.RK_TASK_RPC_REPLY);

        Object response = rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.RK_TASK_RPC_REQ,
                request
        );

        if (response == null) return null;
        try {
            return objectMapper.convertValue(response, Map.class);
        } catch (Exception e) {
            logger.error("Failed to parse getUserRole response", e);
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private List<TaskDTO> parseTaskList(Object response) {
        if (response == null) return Collections.emptyList();
        try {
            JavaType type = objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, TaskDTO.class);
            return objectMapper.convertValue(response, type);
        } catch (Exception e) {
            logger.error("Failed to parse task list response", e);
            return Collections.emptyList();
        }
    }

    public List<com.springboot.telegrambot.dto.SprintDTO> getAllSprints() {
        TaskRpcRequest request = new TaskRpcRequest();
        request.setQueryType(TaskRpcRequest.QueryType.GET_ALL_SPRINTS);
        request.setCorrelationId(UUID.randomUUID().toString());
        request.setReplyTo(RabbitMQConfig.RK_TASK_RPC_REPLY);

        Object response = rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.RK_TASK_RPC_REQ,
                request
        );

        if (response == null) return Collections.emptyList();
        try {
            JavaType type = objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, com.springboot.telegrambot.dto.SprintDTO.class);
            return objectMapper.convertValue(response, type);
        } catch (Exception e) {
            logger.error("Failed to parse sprint list response", e);
            return Collections.emptyList();
        }
    }
}