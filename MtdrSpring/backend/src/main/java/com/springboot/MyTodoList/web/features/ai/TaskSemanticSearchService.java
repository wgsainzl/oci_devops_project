package com.springboot.MyTodoList.web.features.ai;

import com.springboot.MyTodoList.web.features.ai.dto.SemanticTaskSearchResult;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.StringReader;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class TaskSemanticSearchService {

    private final JdbcTemplate jdbcTemplate;
    private final GeminiEmbeddingClient geminiEmbeddingClient;

    public TaskSemanticSearchService(
            JdbcTemplate jdbcTemplate,
            GeminiEmbeddingClient geminiEmbeddingClient
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.geminiEmbeddingClient = geminiEmbeddingClient;
    }

    public List<SemanticTaskSearchResult> searchTasks(String query, Integer limit) {
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("Search query must not be empty");
        }

        int safeLimit = normalizeLimit(limit);

        float[] queryVector = geminiEmbeddingClient.embedQuery(query);

        if (queryVector.length != geminiEmbeddingClient.getDimensions()) {
            throw new IllegalStateException(
                    "Expected query embedding dimensions "
                            + geminiEmbeddingClient.getDimensions()
                            + " but got "
                            + queryVector.length
            );
        }

        String queryVectorJson = toJsonArray(queryVector);

        String sql = """
                WITH query_vector AS (
                    SELECT TO_VECTOR(?, %d, FLOAT32) AS v
                    FROM DUAL
                )
                SELECT
                    e.TASK_ID,
                    t.TITLE,
                    t.DESCRIPTION,
                    t.STATUS,
                    t.PRIORITY,
                    t.SPRINT_ID,
                    t.RESPONSIBLE_ID,
                    u.NAME AS RESPONSIBLE_NAME,
                    VECTOR_DISTANCE(e.EMBEDDING, q.v, COSINE) AS DISTANCE,
                    DBMS_LOB.SUBSTR(e.CONTENT_TEXT, 500, 1) AS CONTENT_PREVIEW
                FROM TASK_AI_EMBEDDINGS e
                JOIN TASKS t ON t.TASK_ID = e.TASK_ID
                LEFT JOIN USERS u ON t.RESPONSIBLE_ID = u.USER_ID
                CROSS JOIN query_vector q
                ORDER BY DISTANCE ASC
                FETCH FIRST %d ROWS ONLY
                """.formatted(geminiEmbeddingClient.getDimensions(), safeLimit);

        return jdbcTemplate.query(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql);
            ps.setCharacterStream(1, new StringReader(queryVectorJson), queryVectorJson.length());
            return ps;
        }, (rs, rowNum) -> new SemanticTaskSearchResult(
                rs.getLong("TASK_ID"),
                rs.getString("TITLE"),
                rs.getString("DESCRIPTION"),
                rs.getString("STATUS"),
                rs.getString("PRIORITY"),
                nullableLong(rs.getObject("SPRINT_ID")),
                nullableLong(rs.getObject("RESPONSIBLE_ID")),
                rs.getString("RESPONSIBLE_NAME"),
                rs.getDouble("DISTANCE"),
                rs.getString("CONTENT_PREVIEW")
        ));
    }

    private static int normalizeLimit(Integer limit) {
        if (limit == null) {
            return 5;
        }

        if (limit < 1) {
            return 5;
        }

        return Math.min(limit, 20);
    }

    private static String toJsonArray(float[] vector) {
        return IntStream.range(0, vector.length)
                .mapToObj(i -> Float.toString(vector[i]))
                .collect(Collectors.joining(",", "[", "]"));
    }

    private static Long nullableLong(Object value) {
        if (value == null) {
            return null;
        }

        return ((Number) value).longValue();
    }
}