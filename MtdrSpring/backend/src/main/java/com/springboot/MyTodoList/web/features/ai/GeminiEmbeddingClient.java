package com.springboot.MyTodoList.web.features.ai;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;

@Service
@Profile("vectorize")
public class GeminiEmbeddingClient {

    private final WebClient webClient = WebClient.builder().build();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.embedding.url}")
    private String embeddingUrl;

    @Value("${gemini.embedding.model:gemini-embedding-2}")
    private String model;

    @Value("${gemini.embedding.dimensions:768}")
    private int dimensions;

    public float[] embedTaskDocument(String title, String contentText) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY is not configured");
        }

        String prompt = """
                title: %s | text: %s
                """.formatted(title == null || title.isBlank() ? "none" : title, contentText);

        Map<String, Object> body = Map.of(
                "content", Map.of(
                        "parts", List.of(
                                Map.of("text", prompt)
                        )
                ),
                "output_dimensionality", dimensions
        );

        JsonNode response = webClient.post()
                .uri(embeddingUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .header("x-goog-api-key", apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        return extractEmbeddingValues(response);
    }

    private float[] extractEmbeddingValues(JsonNode response) {
        if (response == null) {
            throw new IllegalStateException("Gemini response was null");
        }

        JsonNode valuesNode;

        if (response.path("embeddings").isArray() && response.path("embeddings").size() > 0) {
            valuesNode = response.path("embeddings").get(0).path("values");
        } else {
            valuesNode = response.path("embedding").path("values");
        }

        if (!valuesNode.isArray()) {
            throw new IllegalStateException("Gemini response does not contain embedding values: " + response);
        }

        float[] vector = new float[valuesNode.size()];

        for (int i = 0; i < valuesNode.size(); i++) {
            vector[i] = (float) valuesNode.get(i).asDouble();
        }

        return vector;
    }

    public String getModel() {
        return model;
    }

    public int getDimensions() {
        return dimensions;
    }
}