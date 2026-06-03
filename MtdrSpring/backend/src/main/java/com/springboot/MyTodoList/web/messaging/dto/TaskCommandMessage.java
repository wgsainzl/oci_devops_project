package com.springboot.MyTodoList.web.messaging.dto;

import com.springboot.MyTodoList.web.features.task.dto.TaskDTO;
import java.io.Serializable;

public class TaskCommandMessage implements Serializable {

    public enum CommandType {
        CREATE, UPDATE_STATUS, DELETE, COMPLETE_TASK
    }

    private CommandType commandType;
    private TaskDTO task;
    private double actualHours;
    private Integer taskId;
    private String newStatus;
    private String telegramId;

    public TaskCommandMessage() {}

    // Getters and setters
    public CommandType getCommandType() { return commandType; }
    public void setCommandType(CommandType commandType) { this.commandType = commandType; }

    public TaskDTO getTask() { return task; }
    public void setTask(TaskDTO task) { this.task = task; }

    public Integer getTaskId() { return taskId; }
    public void setTaskId(Integer taskId) { this.taskId = taskId; }

    public double getActualHours() {return actualHours; }
    public void setActualHours(double actualHours) { this.actualHours = actualHours; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getTelegramId() { return telegramId; }
    public void setTelegramId(String telegramId) { this.telegramId = telegramId; }
}