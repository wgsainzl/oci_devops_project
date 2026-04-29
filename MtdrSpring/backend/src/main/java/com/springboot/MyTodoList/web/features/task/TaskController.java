package com.springboot.MyTodoList.web.features.task;

import com.springboot.MyTodoList.web.features.task.Task;
import com.springboot.MyTodoList.web.features.task.TaskService;
import com.springboot.MyTodoList.web.features.task.TaskStatus;
import com.springboot.MyTodoList.web.features.task.dto.TaskDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    
    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllToDoItems(){
        List<Task> tasks = taskService.findAll();
        // Convert the list of raw entities to a list of DTOs
        List<TaskDTO> taskDTOs = tasks.stream()
                .map(TaskDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getToDoItemById(@PathVariable int id){
        Optional<Task> task = taskService.getTaskById(id);
        return task.map(t -> ResponseEntity.ok(TaskDTO.fromEntity(t)))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TaskDTO> addToDoItem(@RequestBody Task newTask) throws Exception{
        Task createdTask = taskService.createTask(newTask);
        return ResponseEntity.status(HttpStatus.CREATED).body(TaskDTO.fromEntity(createdTask));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateToDoItem(@RequestBody Task updatedData, @PathVariable int id){
        Task updatedTask = taskService.updateTask(id, updatedData);
        if (updatedTask != null) {
            return ResponseEntity.ok(TaskDTO.fromEntity(updatedTask));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteTaskItem(@PathVariable("id") int id){
       boolean isDeleted = taskService.deleteTaskItem(id);
       if (isDeleted){
        return ResponseEntity.noContent().build();
       } else{
        return ResponseEntity.notFound().build();
       }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDTO> updateTaskStatus(@PathVariable int id, @RequestBody Map<String, String> requestBody) {
        String statusString = requestBody.get("status");
        String userIdString = requestBody.get("userId");
        Long currentUserId = null;
        
        if (userIdString != null) {
            currentUserId = Long.parseLong(userIdString);
        }

        try {
            TaskStatus newStatus = TaskStatus.valueOf(statusString.toUpperCase());
            Task updatedTask = taskService.updateTaskStatus(id, newStatus, currentUserId);
            
            if (updatedTask != null) {
                return ResponseEntity.ok(TaskDTO.fromEntity(updatedTask));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/summary/{userId}")
    public ResponseEntity<List<TaskDTO>> getWeeklySummaryTasks(
            @PathVariable Integer userId,
            @RequestParam OffsetDateTime weekStart,
            @RequestParam OffsetDateTime weekEnd) {
        List<Task> tasks = taskService.getWeeklySummaryTasks(userId, weekStart, weekEnd);
        List<TaskDTO> taskDTOs = tasks.stream()
                .map(TaskDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    @GetMapping("/summary/allTasks")
    public ResponseEntity<List<TaskDTO>> findAllWeeklySummaryTasks(
            @RequestParam OffsetDateTime weekStart,
            @RequestParam OffsetDateTime weekEnd) {
        List<Task> tasks = taskService.findAllWeeklySummaryTasks(weekStart, weekEnd);
        List<TaskDTO> taskDTOs = tasks.stream()
                .map(TaskDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }
}