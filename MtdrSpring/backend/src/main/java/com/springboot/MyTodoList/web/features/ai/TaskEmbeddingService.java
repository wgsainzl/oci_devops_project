package com.springboot.MyTodoList.web.features.ai;

import java.io.StringReader;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskEmbeddingService {

    private final JdbcTemplate jdbcTemplate;
    private final GeminiEmbeddingClient geminiEmbeddingClient;

    public TaskEmbeddingService(
            JdbcTemplate jdbcTemplate,
            GeminiEmbeddingClient geminiEmbeddingClient
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.geminiEmbeddingClient = geminiEmbeddingClient;
    }

    @Transactional
    public int vectorizeAllTasks() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
        SELECT
            t.TASK_ID,
            t.TITLE,
            t.DESCRIPTION,
            t.STATUS,
            t.PRIORITY,
            t.RESPONSIBLE_ID,
            t.SPRINT_ID,
            t.CREATOR_ID,
            t.MANAGER_ID,
            t.ACTUAL_HOURS,
            t.ESTIMATED_HOURS,
            t.START_DATE,
            t.DUE_DATE,
            t.CREATED_AT,
            t.UPDATED_AT,
            t.COMPLETED_AT,
            u.NAME AS RESPONSIBLE_NAME,
            u.TEAM_ID
        FROM TASKS t
        LEFT JOIN USERS u ON t.RESPONSIBLE_ID = u.USER_ID
        """);
        int count = 0;

        for (Map<String, Object> row : rows) {
            vectorizeOneTask(row);
            count++;
        }

        return count;
    }

    private void vectorizeOneTask(Map<String, Object> row) {
        long taskId = numberValue(row.get("TASK_ID"));
        Long teamId = nullableLong(row.get("TEAM_ID"));
        Long sprintId = nullableLong(row.get("SPRINT_ID"));
        Long responsibleId = nullableLong(row.get("RESPONSIBLE_ID"));

        Object updatedAt = row.get("UPDATED_AT");
        String title = stringValue(row.get("TITLE"));

        String contentText = """
                Task ID: %s
                Title: %s
                Description: %s
                Status: %s
                Priority: %s
                Responsible: %s
                Sprint ID: %s
                Estimated hours: %s
                Actual hours: %s
                Start date: %s
                Due date: %s
                """.formatted(
                row.get("TASK_ID"),
                row.get("TITLE"),
                row.get("DESCRIPTION"),
                row.get("STATUS"),
                row.get("PRIORITY"),
                row.get("RESPONSIBLE_NAME"),
                row.get("SPRINT_ID"),
                row.get("ESTIMATED_HOURS"),
                row.get("ACTUAL_HOURS"),
                row.get("START_DATE"),
                row.get("DUE_DATE")
        );

        float[] vector = geminiEmbeddingClient.embedTaskDocument(title, contentText);

        if (vector.length != geminiEmbeddingClient.getDimensions()) {
            throw new IllegalStateException(
                    "Expected embedding dimensions "
                            + geminiEmbeddingClient.getDimensions()
                            + " but got "
                            + vector.length
            );
        }

        String vectorJson = toJsonArray(vector);

        jdbcTemplate.update("DELETE FROM TASK_AI_EMBEDDINGS WHERE TASK_ID = ?", taskId);

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO TASK_AI_EMBEDDINGS (
                        TASK_ID,
                        TEAM_ID,
                        SPRINT_ID,
                        RESPONSIBLE_ID,
                        CONTENT_TYPE,
                        CONTENT_TEXT,
                        EMBEDDING_MODEL,
                        EMBEDDING_DIMENSIONS,
                        EMBEDDING,
                        SOURCE_UPDATED_AT,
                        UPDATED_AT
                    )
                    VALUES (
                        ?, ?, ?, ?,
                        'TASK',
                        ?,
                        ?,
                        ?,
                        TO_VECTOR(?, 768, FLOAT32),
                        ?,
                        SYSTIMESTAMP
                    )
                    """);

            ps.setLong(1, taskId);
            setNullableLong(ps, 2, teamId);
            setNullableLong(ps, 3, sprintId);
            setNullableLong(ps, 4, responsibleId);
            ps.setCharacterStream(5, new StringReader(contentText), contentText.length());
            ps.setString(6, geminiEmbeddingClient.getModel());
            ps.setInt(7, geminiEmbeddingClient.getDimensions());
            ps.setCharacterStream(8, new StringReader(vectorJson), vectorJson.length());
            ps.setObject(9, updatedAt);

            return ps;
        });
    }

    private static String toJsonArray(float[] vector) {
        return IntStream.range(0, vector.length)
                .mapToObj(i -> Float.toString(vector[i]))
                .collect(Collectors.joining(",", "[", "]"));
    }

    private static long numberValue(Object value) {
        return ((Number) value).longValue();
    }

    private static Long nullableLong(Object value) {
        return value == null ? null : ((Number) value).longValue();
    }

    private static String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static void setNullableLong(PreparedStatement ps, int index, Long value) throws java.sql.SQLException {
        if (value == null) {
            ps.setObject(index, null);
        } else {
            ps.setLong(index, value);
        }
    }
}