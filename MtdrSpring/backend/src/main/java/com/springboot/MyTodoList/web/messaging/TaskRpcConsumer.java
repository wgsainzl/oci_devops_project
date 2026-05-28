package com.springboot.MyTodoList.web.messaging;

import com.springboot.MyTodoList.web.config.RabbitMQConfig;
import com.springboot.MyTodoList.web.features.task.TaskService;
import com.springboot.MyTodoList.web.features.task.dto.TaskDTO;
import com.springboot.MyTodoList.web.features.user.UserRepository;
import com.springboot.MyTodoList.web.messaging.dto.TaskRpcRequest;

import org.springframework.transaction.annotation.Transactional;
import com.springboot.MyTodoList.web.messaging.dto.SprintDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
public class TaskRpcConsumer {

    private static final Logger logger = LoggerFactory.getLogger(TaskRpcConsumer.class);

    @Autowired private TaskService taskService;
    @Autowired private UserRepository userRepository;
    @Autowired private com.springboot.MyTodoList.web.features.sprint.SprintRepository sprintRepository;

    @Transactional(readOnly = true)
    @RabbitListener(queues = RabbitMQConfig.TASK_RPC_REQUEST)
    public Object handleRpcRequest(TaskRpcRequest request) {
        if (request == null || request.getQueryType() == null) {
            logger.warn("Received malformed RPC request with null queryType; discarding");
            return null;
        }

        logger.info("Received RPC request: {}", request.getQueryType());

        switch (request.getQueryType()) {
            case GET_ALL_TASKS: {
                return taskService.findAll().stream()
                        .map(TaskDTO::fromEntity) // <-- Radically simplified!
                        .collect(Collectors.toList());
            }
            case GET_TASKS_FOR_SPRINT: {
                return taskService.getTasksBySprintId(request.getSprintId())
                        .stream()
                        .map(TaskDTO::fromEntity)
                        .collect(Collectors.toList());
            }
            case GET_USER_ROLE: {
                return userRepository.findByTelegramUserID(request.getTelegramId())
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
            case GET_ALL_SPRINTS: {
                return sprintRepository.findAll().stream()
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

            case GET_TASKS_BY_TEAMID: {
                return taskService.getTasksByTeamId(request.getTeamId()).stream()
                        .map(TaskDTO::fromEntity)
                        .collect(Collectors.toList());
            }

            case GET_TASKS_FOR_SPRINT_BY_TEAMID: {
                return taskService.getTasksByTeamAndSprint(request.getSprintId(), request.getTeamId()).stream()
                        .map(TaskDTO::fromEntity)
                        .collect(Collectors.toList());
            }

            case GET_ALL_SPRINTS_BY_TEAMID: {
                return sprintRepository.findByTeam_TeamId(request.getTeamId()).stream()
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
            
            default: {
                logger.warn("Unknown RPC query type: {}", request.getQueryType());
                return null;
            }
        }
    }
}