package com.springboot.MyTodoList.web.features.ai;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("vectorize")
public class TaskEmbeddingBackfillRunner implements CommandLineRunner {

    private final TaskEmbeddingService taskEmbeddingService;

    public TaskEmbeddingBackfillRunner(TaskEmbeddingService taskEmbeddingService) {
        this.taskEmbeddingService = taskEmbeddingService;
    }

    @Override
    public void run(String... args) {
        int total = taskEmbeddingService.vectorizeAllTasks();
        System.out.println("Vectorized tasks: " + total);
    }
}