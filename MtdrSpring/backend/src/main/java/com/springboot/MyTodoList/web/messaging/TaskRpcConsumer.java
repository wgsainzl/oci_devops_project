package com.springboot.MyTodoList.web.messaging;

import com.springboot.MyTodoList.web.config.RabbitMQConfig;
import com.springboot.MyTodoList.web.features.task.Task;
import com.springboot.MyTodoList.web.features.task.TaskService;
import com.springboot.MyTodoList.web.features.task.dto.TaskDTO;
import com.springboot.MyTodoList.web.features.user.UserRepository;
import com.springboot.MyTodoList.web.messaging.dto.TaskRpcRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.springboot.MyTodoList.web.messaging.dto.SprintDTO;

@Component
public class TaskRpcConsumer {

    private static final Logger logger = LoggerFactory.getLogger(TaskRpcConsumer.class);

    @Autowired private TaskService taskService;
    @Autowired private UserRepository userRepository;
    @Autowired private RabbitTemplate rabbitTemplate;
    @Autowired private com.springboot.MyTodoList.web.features.sprint.SprintRepository sprintRepository;

    @RabbitListener(queues = RabbitMQConfig.TASK_RPC_REQUEST)
    public void handleRpcRequest(TaskRpcRequest request) {
        logger.info("Received RPC request: {}", request.getQueryType());

        Object response = null;

        switch (request.getQueryType()) {
            case GET_ALL_TASKS -> {
                List<TaskDTO> tasks = taskService.findAll().stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList());
                response = tasks;
            }
            case GET_TASKS_FOR_SPRINT -> {
                List<TaskDTO> tasks = taskService.getTasksBySprintId(request.getSprintId())
                        .stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList());
                response = tasks;
            }
            case GET_USER_ROLE -> {
                response = userRepository.findByTelegramUserID(request.getTelegramId())
                        .map(u -> {
                            String roleName = u.getRoles().stream()
                                    .findFirst()
                                    .map(r -> r.getName())
                                    .orElse("USER");
                            return Map.of(
                                    "userId", u.getUserId(),
                                    "role", roleName
                            );
                        })
                        .orElse(null);
            }
            case GET_ALL_SPRINTS -> {
                response = sprintRepository.findAll().stream()
                        .map(s -> {
                            SprintDTO dto = new SprintDTO();
                            dto.setSprintId(s.getSprintId());
                            dto.setSprintName(s.getSprintName());
                            dto.setStartDate(s.getStartDate());
                            dto.setEndDate(s.getEndDate());
                            return dto;
                        })
                        .collect(Collectors.toList());
            }
            default -> logger.warn("Unknown RPC query type: {}", request.getQueryType());
        }

        if (request.getReplyTo() != null && request.getCorrelationId() != null) {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    request.getReplyTo(),
                    response != null ? response : Map.of()
            );
            logger.info("Sent RPC reply to {}", request.getReplyTo());
        }
    }

    private TaskDTO toDTO(Task task) {
        Map<String, Object> sprintMap = null;
        if (task.getSprint() != null) {
            sprintMap = new java.util.HashMap<>();
            sprintMap.put("sprintId", task.getSprint().getSprintId());
            sprintMap.put("sprintName", task.getSprint().getSprintName());
        }

        return new TaskDTO(
                String.valueOf(task.getTaskId()),
                task.getTitle(),
                task.getDescription(),
                task.getStatus() != null ? task.getStatus().name() : null,
                task.getPriority() != null ? task.getPriority().name() : null,
                task.getCreatedAt() != null ? task.getCreatedAt().toString() : null,
                task.getDueDate() != null ? task.getDueDate().toString() : null,
                task.getStartDate() != null ? task.getStartDate().toString() : null,
                task.getResponsible() != null ? task.getResponsible().getName() : null,
                task.getResponsible() != null ? String.valueOf(task.getResponsible().getUserId()) : null,
                task.getEstimatedHours(),
                task.getActualHours(),
                sprintMap
        );
    }
}