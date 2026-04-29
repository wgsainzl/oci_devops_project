package com.springboot.MyTodoList.web.features.tasklog;
import java.time.OffsetDateTime;
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
            "    NVL(T.title, 'Deleted/Unknown Task') AS task_title, " +
            "    L.field_name as field_name, " +
            "    L.old_value as old_value, " +
            "    L.new_value as new_value " +
            "FROM TASK_LOGS L " + 
            "LEFT JOIN TASKS T ON L.task_id = T.task_id " + 
            "WHERE L.user_id = :targetUserId " +
            "  AND L.timestamp >= SYSDATE - 60 " +
            "ORDER BY L.timestamp ASC", 
            nativeQuery = true)
    List<Object[]> findWeeklyTaskLogsByUser(@Param("targetUserId") Integer targetUserId);

    @Query(value = "SELECT l.log_id, t.title, l.field_name, l.old_value, l.new_value " +
                   "FROM task_logs l " +
                   "JOIN tasks t ON l.task_id = t.task_id " +
                   "ORDER BY l.timestamp DESC", 
           nativeQuery = true)
    List<Object[]> findAllLogsWithTaskNames();

    @Query(value = "SELECT l.log_id, t.title, l.field_name, l.old_value, l.new_value, TO_CHAR(l.timestamp, 'YYYY-MM-DD HH24:MI:SS') " +
            "FROM task_logs l " +
            "JOIN tasks t ON l.task_id = t.task_id " +
            "WHERE l.timestamp >= SYSDATE - 60 " + // or whatever your WHERE clause currently is
            "ORDER BY l.timestamp DESC", 
    nativeQuery = true)
    List<Object[]> findTaskLogsSince();
    
    @Query(value = "SELECT " +
            "    L.timestamp as timestamp, " +
            "    NVL(T.title, 'Deleted/Unknown Task') AS task_title, " +
            "    L.field_name as field_name, " +
            "    L.old_value as old_value, " +
            "    L.new_value as new_value " +
            "FROM TASK_LOGS L " + 
            "LEFT JOIN TASKS T ON L.task_id = T.task_id " + 
            "WHERE L.timestamp >= SYSDATE - 60 " +
            "ORDER BY L.timestamp ASC", 
            nativeQuery = true)
    List<Object[]> findWeeklyTaskLogsAll();

    @Query(value = "SELECT l.log_id, t.title, l.field_name, l.old_value, l.new_value, " +
        "TO_CHAR(l.timestamp, 'YYYY-MM-DD HH24:MI:SS') " +
        "FROM task_logs l " +
        "JOIN tasks t ON l.task_id = t.task_id " +
        "WHERE l.timestamp >= SYSDATE - 30 " +  // ✅ sin parámetro Java
        "ORDER BY l.timestamp DESC",
        nativeQuery = true)
    List<Object[]> findAllTaskLogsSummary(); // ✅ sin parámetro
}