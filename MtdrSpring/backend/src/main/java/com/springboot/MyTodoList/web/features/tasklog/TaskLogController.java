package com.springboot.MyTodoList.web.features.tasklog;

import java.time.OffsetDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
public class TaskLogController {

    @Autowired
    private TaskLogRepository taskLogRepository;

    // GET /dashboard/activity?limit=20
    @GetMapping("/activity")
    public ResponseEntity<List<TaskLog>> getRecentActivity(
            @RequestParam(required = false) String teamId,
            @RequestParam(defaultValue = "20") int limit) {

        List<TaskLog> recentLogs = taskLogRepository
                .findAllByOrderByTimestampDesc(PageRequest.of(0, limit));
        return ResponseEntity.ok(recentLogs);
    }

    // GET /dashboard/summary/{userId}
    @GetMapping("/summary/{userId}")
    public ResponseEntity<List<Object[]>> getWeeklyTaskLogsSummary(
            @PathVariable Integer userId) {

        List<Object[]> weeklyLogs = taskLogRepository.findWeeklyTaskLogsByUser(userId);
        return ResponseEntity.ok(weeklyLogs);
    }

    @GetMapping("/summary/all")
    public ResponseEntity<List<String[]>> getTaskLogsSummaryAll() {
        List<Object[]> logs = taskLogRepository.findAllTaskLogsSummary(); // ✅ sin parámetro

        List<String[]> result = logs.stream()
                .map(row -> new String[]{
                        row[0] != null ? row[0].toString() : null,
                        row[1] != null ? row[1].toString() : null,
                        row[2] != null ? row[2].toString() : null,
                        row[3] != null ? row[3].toString() : null,
                        row[4] != null ? row[4].toString() : null,
                        row[5] != null ? row[5].toString() : null
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}