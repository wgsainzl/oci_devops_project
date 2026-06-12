package com.springboot.MyTodoList.web.features.ai;

import com.springboot.MyTodoList.web.features.ai.dto.SemanticTaskSearchRequest;
import com.springboot.MyTodoList.web.features.ai.dto.SemanticTaskSearchResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/tasks")
public class TaskSemanticSearchController {

    private final TaskSemanticSearchService taskSemanticSearchService;

    public TaskSemanticSearchController(TaskSemanticSearchService taskSemanticSearchService) {
        this.taskSemanticSearchService = taskSemanticSearchService;
    }

    @PostMapping("/semantic-search")
    public ResponseEntity<List<SemanticTaskSearchResult>> semanticSearch(
            @RequestBody SemanticTaskSearchRequest request
    ) {
        List<SemanticTaskSearchResult> results =
                taskSemanticSearchService.searchTasks(request.query(), request.limit());

        return ResponseEntity.ok(results);
    }
}