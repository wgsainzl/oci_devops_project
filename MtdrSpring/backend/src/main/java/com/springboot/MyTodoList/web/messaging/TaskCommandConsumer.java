package com.springboot.MyTodoList.web.messaging;

import com.springboot.MyTodoList.web.features.task.TaskService;
import com.springboot.MyTodoList.web.features.task.TaskStatus;
import com.springboot.MyTodoList.web.features.task.Task;
import com.springboot.MyTodoList.web.features.task.dto.TaskDTO;
import com.springboot.MyTodoList.web.messaging.dto.TaskCommandMessage;
import com.springboot.MyTodoList.web.config.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TaskCommandConsumer {

    private static final Logger logger = LoggerFactory.getLogger(TaskCommandConsumer.class);

    @Autowired
    private TaskService taskService;

    @RabbitListener(queues = RabbitMQConfig.TASK_COMMANDS_QUEUE)
    public void handleTaskCommand(TaskCommandMessage message) {
        if (message == null || message.getCommandType() == null) {
            logger.warn("Received malformed task command message; discarding");
            return;
        }

        logger.info("Received task command: {}", message.getCommandType());

        switch (message.getCommandType()) {
            case CREATE -> {
                Task task = toEntity(message.getTask());
                taskService.createTaskFromTelegram(task, message.getTelegramId());
                logger.info("Task created from Telegram user {}", message.getTelegramId());
            }
            case UPDATE_STATUS -> {
                try {
                    TaskStatus status = TaskStatus.valueOf(message.getNewStatus());
                    taskService.updateTaskStatus(message.getTaskId(), status, null);
                    logger.info("Task {} updated to status {}", message.getTaskId(), status);
                } catch (IllegalArgumentException e) {
                    logger.error("Invalid status provided for task {}: {}", message.getTaskId(), message.getNewStatus(), e);
                }
            }
            case DELETE -> {
                taskService.deleteTaskItem(message.getTaskId());
                logger.info("Task {} deleted", message.getTaskId());
            }
            default -> logger.warn("Unknown command type: {}", message.getCommandType());
        }
    }

    private Task toEntity(TaskDTO dto) {
        Task task = new Task();
        task.setTitle(dto.title());
        task.setDescription(dto.description());
        if (dto.startDate() != null)
            task.setStartDate(java.time.OffsetDateTime.parse(dto.startDate()));
        if (dto.dueDate() != null)
            task.setDueDate(java.time.OffsetDateTime.parse(dto.dueDate()));
        task.setEstimatedHours(dto.estimatedHours());
        task.setPriority(dto.priority() != null
            ? com.springboot.MyTodoList.web.features.task.TaskPriority.valueOf(dto.priority())
            : null);
        if (dto.sprint() != null && dto.sprint().get("sprintId") != null) {
            com.springboot.MyTodoList.web.features.sprint.Sprint sprint =
                new com.springboot.MyTodoList.web.features.sprint.Sprint();
            sprint.setSprintId(((Number) dto.sprint().get("sprintId")).intValue());
            task.setSprint(sprint);
        }
        return task;
    }
}