package com.springboot.telegrambot.messaging;

import com.springboot.telegrambot.config.RabbitMQConfig;
import com.springboot.telegrambot.dto.TaskDTO;
import com.springboot.telegrambot.messaging.dto.TaskCommandMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaskCommandPublisher {

    private static final Logger logger = LoggerFactory.getLogger(TaskCommandPublisher.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void createTask(TaskDTO task, String telegramId) {
        TaskCommandMessage msg = new TaskCommandMessage();
        msg.setCommandType(TaskCommandMessage.CommandType.CREATE);
        msg.setTask(task);
        msg.setTelegramId(telegramId);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_TASK_COMMAND, msg);
        logger.info("Sent CREATE task command for telegramId={}", telegramId);
    }

    public void updateTaskStatus(Integer taskId, String newStatus) {
        TaskCommandMessage msg = new TaskCommandMessage();
        msg.setCommandType(TaskCommandMessage.CommandType.UPDATE_STATUS);
        msg.setTaskId(taskId);
        msg.setNewStatus(newStatus);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_TASK_COMMAND, msg);
        logger.info("Sent UPDATE_STATUS command for taskId={} status={}", taskId, newStatus);
    }

    public void deleteTask(Integer taskId) {
        TaskCommandMessage msg = new TaskCommandMessage();
        msg.setCommandType(TaskCommandMessage.CommandType.DELETE);
        msg.setTaskId(taskId);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_TASK_COMMAND, msg);
        logger.info("Sent DELETE command for taskId={}", taskId);
    }
}