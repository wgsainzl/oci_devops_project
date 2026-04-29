package com.springboot.MyTodoList.web.features.summaryjob;

import com.springboot.MyTodoList.web.features.summaryjob.dto.SummaryJobCreateRequest;
import com.springboot.MyTodoList.web.features.summaryjob.dto.SummaryJobUpdateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/summary-jobs")
public class SummaryJobController {

    private final SummaryJobService summaryJobService;

    public SummaryJobController(SummaryJobService summaryJobService) {
        this.summaryJobService = summaryJobService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPending(@RequestBody SummaryJobCreateRequest request) {
        SummaryJob job = summaryJobService.createPendingJob(request);
        return ResponseEntity.ok(Map.of("jobId", job.getJobId(), "status", job.getStatus().name()));
    }

    @PatchMapping("/{jobId}/processing")
    public ResponseEntity<Map<String, Object>> markProcessing(@PathVariable Long jobId) {
        SummaryJob job = summaryJobService.markProcessing(jobId);
        return ResponseEntity.ok(Map.of("jobId", job.getJobId(), "status", job.getStatus().name()));
    }

    @PatchMapping("/{jobId}/sent")
    public ResponseEntity<Map<String, Object>> markSent(@PathVariable Long jobId, @RequestBody SummaryJobUpdateRequest request) {
        SummaryJob job = summaryJobService.markSent(jobId, request.getGeneratedSummary());
        return ResponseEntity.ok(Map.of("jobId", job.getJobId(), "status", job.getStatus().name()));
    }

    @PatchMapping("/{jobId}/failed")
    public ResponseEntity<Map<String, Object>> markFailed(@PathVariable Long jobId, @RequestBody SummaryJobUpdateRequest request) {
        SummaryJob job = summaryJobService.markFailed(jobId, request.getErrorMessage());
        return ResponseEntity.ok(Map.of("jobId", job.getJobId(), "status", job.getStatus().name()));
    }
}
