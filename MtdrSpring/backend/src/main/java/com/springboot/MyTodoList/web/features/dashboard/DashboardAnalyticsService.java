package com.springboot.MyTodoList.web.features.dashboard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DashboardAnalyticsService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> getHoursPerDeveloperPerSprint() {
        String sql = "SELECT " +
                "u.name AS developer_name, " +
                "s.sprint_name, " +
                "SUM(t.actual_hours) AS total_hours_worked " +
                "FROM Tasks t " +
                "JOIN Users u ON t.responsible_id = u.user_id " +
                "JOIN Sprints s ON t.sprint_id = s.sprint_id " +
                "GROUP BY u.name, s.sprint_name, s.start_date " +
                "ORDER BY s.start_date ASC, u.name";
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getTasksPerSprint() {
        String sql = "SELECT " +
                "u.name AS developer_name, " +
                "s.sprint_name, " +
                "COUNT(t.task_id) AS tasks_completed " +
                "FROM Tasks t " +
                "JOIN Users u ON t.responsible_id = u.user_id " +
                "JOIN Sprints s ON t.sprint_id = s.sprint_id " +
                "JOIN Task_Status ts ON t.status = ts.status_name " +
                "WHERE t.status = 'DONE' " +
                "GROUP BY u.name, s.sprint_name, s.start_date " +
                "ORDER BY s.start_date ASC, u.name";
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getInfrastructureCosts() {
        String sql = "SELECT " +
                "record_date, " +
                "oci_service, " +
                "SUM(daily_cost_usd) AS daily_total " +
                "FROM infrastructure_costs " +
                "WHERE record_date >= CURRENT_DATE - 30 " +
                "GROUP BY record_date, oci_service " +
                "ORDER BY record_date ASC";
        return jdbcTemplate.queryForList(sql);
    }
}