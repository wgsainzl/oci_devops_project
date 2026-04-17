package com.springboot.MyTodoList.features.task;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task,Integer> {
    // chat code lol
    // Find all tasks assigned to a specific user (by their User ID)
    List<Task> findByResponsible_UserId(Integer userId);
    // Find all tasks created by a specific user
    List<Task> findByCreator_UserId(Integer userId);
    // Find all tasks with a specific status 
    List<Task> findByStatus(TaskStatus status);
    // Assuming your Sprint.java primary key variable is named 'sprintId'
    List<Task> findBySprint_SprintId(Integer sprintId);

    // Find all tasks for a user that are NOT done yet
    List<Task> findByResponsible_UserIdAndStatusNot(Integer userId, TaskStatus status);
}
