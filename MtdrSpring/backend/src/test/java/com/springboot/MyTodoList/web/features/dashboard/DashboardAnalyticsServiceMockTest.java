package com.springboot.MyTodoList.web.features.dashboard;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardAnalyticsServiceMockTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private DashboardAnalyticsService analyticsService;

    @Test
    void verTareasCompletadasDeUnSprint() {
        List<Map<String, Object>> fakeRows = List.of(
                Map.of(
                        "developer_name", "Jose",
                        "sprint_name", "Sprint 3",
                        "tasks_completed", 2
                ),
                Map.of(
                        "developer_name", "Maria",
                        "sprint_name", "Sprint 3",
                        "tasks_completed", 1
                )
        );

        when(jdbcTemplate.queryForList(argThat(sql ->
                sql != null && sql.contains("WHERE t.status = 'DONE'")
        ))).thenReturn(fakeRows);

        List<Map<String, Object>> result = analyticsService.getTasksPerSprint();

        int totalSprint3 = result.stream()
                .filter(row -> "Sprint 3".equals(row.get("sprint_name")))
                .mapToInt(row -> ((Number) row.get("tasks_completed")).intValue())
                .sum();

        assertThat(result).hasSize(2);
        assertThat(totalSprint3).isEqualTo(3);

        verify(jdbcTemplate).queryForList(argThat(sql ->
                sql != null
                        && sql.contains("WHERE t.status = 'DONE'")
                        && sql.contains("s.sprint_name")
        ));
    }

    @Test
    void verTareasCompletadasDeUsuarioEnSprint() {
        List<Map<String, Object>> fakeRows = List.of(
                Map.of(
                        "developer_name", "Jose",
                        "sprint_name", "Sprint 3",
                        "tasks_completed", 2
                ),
                Map.of(
                        "developer_name", "Maria",
                        "sprint_name", "Sprint 3",
                        "tasks_completed", 1
                )
        );

        when(jdbcTemplate.queryForList(anyString())).thenReturn(fakeRows);

        List<Map<String, Object>> result = analyticsService.getTasksPerSprint();

        Map<String, Object> joseSprint3 = result.stream()
                .filter(row -> "Jose".equals(row.get("developer_name")))
                .filter(row -> "Sprint 3".equals(row.get("sprint_name")))
                .findFirst()
                .orElseThrow();

        assertThat(joseSprint3.get("developer_name")).isEqualTo("Jose");
        assertThat(joseSprint3.get("sprint_name")).isEqualTo("Sprint 3");
        assertThat(joseSprint3.get("tasks_completed")).isEqualTo(2);
    }
}
