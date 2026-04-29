package com.springboot.MyTodoList.web.features.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
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

    @Query(value = "SELECT * FROM Tasks " +
            "WHERE responsible_id = :targetUserId " +
            "  AND ( " +
            "      (status = 'DONE' AND completed_at BETWEEN :weekStart AND :weekEnd) " +
            "      OR " +
            "      status IN ('IN_PROGRESS', 'IN_REVIEW', 'BLOCKED') " +
            "  ) " +
            "ORDER BY status DESC, completed_at DESC",
            nativeQuery = true)
    List<Task> findWeeklySummaryTasks(@Param("targetUserId") Integer targetUserId,
                                      @Param("weekStart") OffsetDateTime weekStart,
                                      @Param("weekEnd") OffsetDateTime weekEnd);

    @Query(value = "SELECT * FROM Tasks " +
            "WHERE (status = 'DONE' AND completed_at BETWEEN :weekStart AND :weekEnd) " +
            "   OR status IN ('IN_PROGRESS', 'IN_REVIEW', 'BLOCKED') " +
            "ORDER BY responsible_id, status DESC",
            nativeQuery = true)
    List<Task> findAllWeeklySummaryTasks(@Param("weekStart") OffsetDateTime weekStart,
                                         @Param("weekEnd") OffsetDateTime weekEnd);
}
