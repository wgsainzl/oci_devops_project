package com.springboot.MyTodoList.features.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ToDoItemService {

    @Autowired
    private TaskRepository taskRepository;
    public List<Task> findAll(){
        return taskRepository.findAll();
    }

    public Optional<Task> getTaskById(int id){
        return taskRepository.findById(id);
    }
    
    public Task createTask(Task task){
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.TODO);
        }
        return taskRepository.save(task);
    }

    public boolean deleteToDoItem(int id){
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
    

}
