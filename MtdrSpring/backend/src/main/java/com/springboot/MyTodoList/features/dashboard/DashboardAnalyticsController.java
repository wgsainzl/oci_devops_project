package com.springboot.MyTodoList.features.dashboard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard/kpis")
public class DashboardAnalyticsController {

    @Autowired
    private DashboardAnalyticsService analyticsService;

    @GetMapping("/hours-per-sprint")
    public ResponseEntity<List<Map<String, Object>>> getHoursKpi() {
        return ResponseEntity.ok(analyticsService.getHoursPerDeveloperPerSprint());
    }

    @GetMapping("/tasks-per-sprint")
    public ResponseEntity<List<Map<String, Object>>> getTasksKpi() {
        return ResponseEntity.ok(analyticsService.getTasksPerSprint());
    }

    @GetMapping("/infrastructure-costs")
    public ResponseEntity<List<Map<String, Object>>> getCostsKpi() {
        return ResponseEntity.ok(analyticsService.getInfrastructureCosts());
    }
}