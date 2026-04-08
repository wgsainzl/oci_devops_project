package com.springboot.MyTodoList.features.tasklog;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard") // Mapped to match your React dashboardAPI!
public class TaskLogController {

    @Autowired
    private TaskLogRepository taskLogRepository;

    // MATCHES FRONTEND: GET /dashboard/activity?limit=20
    @GetMapping("/activity")
    public ResponseEntity<List<TaskLog>> getRecentActivity(
            @RequestParam(required = false) String teamId, // For future team filtering
            @RequestParam(defaultValue = "20") int limit) {
        
        // Use Spring's PageRequest to limit the number of results returned to the frontend
        List<TaskLog> recentLogs = taskLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, limit));
        
        return ResponseEntity.ok(recentLogs);
    }
}