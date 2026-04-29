package com.springboot.MyTodoList.web.features.summaryjob;

import com.springboot.MyTodoList.web.features.role.Role;
import com.springboot.MyTodoList.web.features.summaryjob.dto.SummaryJobCreateRequest;
import com.springboot.MyTodoList.web.features.user.User;
import com.springboot.MyTodoList.web.features.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Comparator;

@Service
public class SummaryJobService {

    private final SummaryJobRepository summaryJobRepository;
    private final UserRepository userRepository;

    public SummaryJobService(SummaryJobRepository summaryJobRepository, UserRepository userRepository) {
        this.summaryJobRepository = summaryJobRepository;
        this.userRepository = userRepository;
    }

    public SummaryJob createPendingJob(SummaryJobCreateRequest request) {
        User user = userRepository.findByTelegramUserID(request.getTelegramUserId())
                .orElseThrow(() -> new IllegalArgumentException("No user mapped to telegram_user_id=" + request.getTelegramUserId()));

        SummaryJob job = new SummaryJob();
        job.setUser(user);
        job.setTargetRole(resolvePrimaryRole(user));
        job.setWeekStart(request.getWeekStart());
        job.setWeekEnd(request.getWeekEnd());
        job.setStatus(SummaryJobStatus.PENDING);
        job.setRetryCount(0);
        job.setCreatedAt(OffsetDateTime.now());
        return summaryJobRepository.save(job);
    }

    public SummaryJob markProcessing(Long jobId) {
        SummaryJob job = getJob(jobId);
        job.setStatus(SummaryJobStatus.PROCESSING);
        job.setUpdatedAt(OffsetDateTime.now());
        job.setErrorMessage(null);
        return summaryJobRepository.save(job);
    }

    public SummaryJob markSent(Long jobId, String generatedSummary) {
        SummaryJob job = getJob(jobId);
        job.setStatus(SummaryJobStatus.SENT);
        job.setGeneratedSummary(generatedSummary);
        job.setErrorMessage(null);
        job.setUpdatedAt(OffsetDateTime.now());
        return summaryJobRepository.save(job);
    }

    public SummaryJob markFailed(Long jobId, String errorMessage) {
        SummaryJob job = getJob(jobId);
        job.setStatus(SummaryJobStatus.FAILED);
        job.setErrorMessage(errorMessage);
        job.setRetryCount((job.getRetryCount() == null ? 0 : job.getRetryCount()) + 1);
        job.setUpdatedAt(OffsetDateTime.now());
        return summaryJobRepository.save(job);
    }

    private SummaryJob getJob(Long jobId) {
        return summaryJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Summary job not found: " + jobId));
    }

    private String resolvePrimaryRole(User user) {
        return user.getRoles().stream()
                .map(Role::getName)
                .filter(name -> name != null && !name.isBlank())
                .min(Comparator.naturalOrder())
                .orElse("DEVELOPER");
    }
}
