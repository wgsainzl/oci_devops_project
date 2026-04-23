package com.springboot.MyTodoList.web.features.tasklog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskLogRepository extends JpaRepository<TaskLog, Integer> {
    
    // Magic Query: Fetch the most recent logs, sorted by newest first.
    // The "Pageable" parameter allows the frontend to set a 'limit' (e.g., top 20).
    List<TaskLog> findAllByOrderByTimestampDesc(Pageable pageable);

    // Magic Query: Fetch recent logs for a specific task
    List<TaskLog> findByTask_TaskIdOrderByTimestampDesc(Integer taskId);

    @Query(value = "SELECT " +
            "    L.timestamp as timestamp, " +
            "    T.title AS task_title, " +
            "    L.field_name as field_name, " +
            "    L.old_value as old_value, " +
            "    L.new_value as new_value " +
            "FROM TaskLogs L " + // Using correct table names depending on entity mappings
            "JOIN Tasks T ON L.task_id = T.task_id " + // ensure table names are correct
            "WHERE L.user_id = :targetUserId " +
            "  AND L.timestamp >= CURRENT_TIMESTAMP - INTERVAL '7' DAY " +
            "ORDER BY L.timestamp ASC", 
            nativeQuery = true)
    List<Object[]> findWeeklyTaskLogsByUser(@Param("targetUserId") Integer targetUserId);
}