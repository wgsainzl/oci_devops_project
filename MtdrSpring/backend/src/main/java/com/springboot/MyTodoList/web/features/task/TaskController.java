package com.springboot.MyTodoList.web.features.task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;
    //@CrossOrigin
    @GetMapping
    public ResponseEntity<List<Task>> getAllToDoItems(){
        List<Task> tasks = taskService.findAll();
        return ResponseEntity.ok(tasks);
    }
    //@CrossOrigin
    @GetMapping("/{id}")
    public ResponseEntity<Task> getToDoItemById(@PathVariable int id){
  
        Optional<Task> task = taskService.getTaskById(id);
        return task.map(ResponseEntity::ok) // if exists, wrapped in response entity
                      .orElseGet(() -> ResponseEntity.notFound().build()); // if not, return response entity not found

    }
    //@CrossOrigin
    @PostMapping
    public ResponseEntity<Task> addToDoItem(@RequestBody Task newTask) throws Exception{
        Task createdTask = taskService.createTask(newTask);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }
    //@CrossOrigin
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateToDoItem(@RequestBody Task updatedData, @PathVariable int id){
        Task updatedTask = taskService.updateTask(id, updatedData);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    //@CrossOrigin
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
    public ResponseEntity<Task> updateTaskStatus(@PathVariable int id, @RequestBody Map<String, String> requestBody) {
        
        String statusString = requestBody.get("status");
        
        // 1. Read the userId from the frontend payload
        String userIdString = requestBody.get("userId");
        Long currentUserId = null;
        if (userIdString != null) {
            currentUserId = Long.parseLong(userIdString);
        }

        try {
            TaskStatus newStatus = TaskStatus.valueOf(statusString.toUpperCase());
            
            // 2. Pass the currentUserId into the service!
            Task updatedTask = taskService.updateTaskStatus(id, newStatus, currentUserId);
            
            if (updatedTask != null) {
                return ResponseEntity.ok(updatedTask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }



}
