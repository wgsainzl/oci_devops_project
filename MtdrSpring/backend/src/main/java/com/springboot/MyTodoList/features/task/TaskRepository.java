package com.springboot.MyTodoList.features.task;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task,Integer> {
    // chat code lol
    // Find all tasks assigned to a specific user (by their User ID)
    List<Task> findByResponsible_Id(Integer userId);

    // Find all tasks created by a specific user
    List<Task> findByCreator_Id(Integer userId);

    // Find all tasks with a specific status (e.g., TODO, DONE)
    List<Task> findByStatus(TaskStatus status);

    // Find all tasks for a user that are NOT done yet
    List<Task> findByResponsible_IdAndStatusNot(Integer userId, TaskStatus status);
}
