package com.springboot.MyTodoList.web.features.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.web.features.user.UserRepository;
import com.springboot.MyTodoList.web.features.tasklog.TaskLog;
import com.springboot.MyTodoList.web.features.tasklog.TaskLogRepository;
import com.springboot.MyTodoList.web.features.user.User;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private TaskLogRepository taskLogRepository;
    @Autowired
    private UserRepository userRepository;
    
    public List<Task> findAll(){
        return taskRepository.findAll();
    }

    public Optional<Task> getTaskById(int id){
        return taskRepository.findById(id);
    }

    public List<Task> getTasksByUserId(Integer userId) {
        return taskRepository.findByResponsible_UserId(userId);
    }
    
    public Task createTask(Task task){
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.TODO);
        }
        return taskRepository.save(task);
    }

    public boolean deleteTaskItem(int id){
        if (taskRepository.existsById(id)){
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }
    public Task updateTask(int id, Task updatedTask){
        Optional<Task> existingData = taskRepository.findById(id);

        if (existingData.isPresent()) {
            Task existingTask = existingData.get();

            if (updatedTask.getTitle() != null) existingTask.setTitle(updatedTask.getTitle());
            if (updatedTask.getDescription() != null) existingTask.setDescription(updatedTask.getDescription());
            if (updatedTask.getStartDate() != null) existingTask.setStartDate(updatedTask.getStartDate());
            if (updatedTask.getDueDate() != null) existingTask.setDueDate(updatedTask.getDueDate());
            if (updatedTask.getEstimatedHours() != null) existingTask.setEstimatedHours(updatedTask.getEstimatedHours());
            if (updatedTask.getActualHours() != null) existingTask.setActualHours(updatedTask.getActualHours());
            if (updatedTask.getPriority() != null) existingTask.setPriority(updatedTask.getPriority());

            //if (updatedTask.getResponsible() != null) existingTask.setResponsible(updatedTask.getResponsible());
            //if (updatedTask.getManager() != null) existingTask.setManager(updatedTask.getManager());

            if (updatedTask.getStatus() != null) {
                existingTask.setStatus(updatedTask.getStatus());
                if (updatedTask.getStatus() == TaskStatus.DONE && existingTask.getCompletedAt() == null) {
                    existingTask.setCompletedAt(OffsetDateTime.now());
                } else if (updatedTask.getStatus() != TaskStatus.DONE) {
                    existingTask.setCompletedAt(null);
                }
            }

            return taskRepository.save(existingTask);
        } else {
            return null;
        }
    }

    public Task updateTaskStatus(int id, TaskStatus newStatus, Long currentUserId) {
        Optional<Task> existingData = taskRepository.findById(id);
        
        if (existingData.isPresent()) {
            Task task = existingData.get();
            TaskStatus oldStatus = task.getStatus(); 
            task.setStatus(newStatus);

            if (newStatus == TaskStatus.DONE) {
                task.setCompletedAt(OffsetDateTime.now());
            } else {
                task.setCompletedAt(null);
            }

            Task savedTask = taskRepository.save(task);

            // CREATE THE LOG
            if (oldStatus != newStatus) {
                User currentUser = null; // SET CURRENT USER HOW??? @JUANMA
                if (currentUserId != null) {
                    currentUser = userRepository.findById(currentUserId).orElse(null);
                }

                String oldStatusStr = (oldStatus != null) ? oldStatus.name() : "NONE";
                String newStatusStr = (newStatus != null) ? newStatus.name() : "NONE";
                taskLogRepository.save(new TaskLog(savedTask, currentUser, "status", oldStatusStr, newStatusStr));
            }

            return savedTask;
        }
        return null;
    }

    public List<Task> getTasksBySprintId(Integer sprintId) {
        return taskRepository.findBySprint_SprintId(sprintId);
    }
    
    public List<Task> getWeeklySummaryTasks(Integer userId, OffsetDateTime weekStart, OffsetDateTime weekEnd) {
        return taskRepository.findWeeklySummaryTasks(userId, weekStart, weekEnd);
    }

    public List<Task> findAllWeeklySummaryTasks(OffsetDateTime weekStart, OffsetDateTime weekEnd) {
        return taskRepository.findAllWeeklySummaryTasks(weekStart, weekEnd);
    }

}
