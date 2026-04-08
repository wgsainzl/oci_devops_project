package com.springboot.MyTodoList.features.tasklog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskLogRepository extends JpaRepository<TaskLog, Integer> {
    
    // Magic Query: Fetch the most recent logs, sorted by newest first.
    // The "Pageable" parameter allows the frontend to set a 'limit' (e.g., top 20).
    List<TaskLog> findAllByOrderByTimestampDesc(Pageable pageable);

    // Magic Query: Fetch recent logs for a specific task
    List<TaskLog> findByTask_IdOrderByTimestampDesc(Integer taskId);
}