package com.springboot.telegrambot.wizard;
import com.springboot.telegrambot.dto.TaskDTO;
import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TaskWizardManager {

    public enum TaskCreationState {
        AWAITING_TITLE,
        AWAITING_DESCRIPTION,
        AWAITING_PRIORITY,
        AWAITING_SPRINT,
        AWAITING_ESTIMATED_HOURS
    }

    public static class TaskDraftSession {
        public TaskCreationState state;
        public TaskDTO draftTask;

        public TaskDraftSession(TaskCreationState state) {
            this.state = state;
            this.draftTask = new TaskDTO();
        }
    }

    private final ConcurrentHashMap<Long, TaskDraftSession> activeDrafts = new ConcurrentHashMap<>();

    public boolean hasActiveDraft(long chatId) {
        return activeDrafts.containsKey(chatId);
    }

    public TaskDraftSession getDraft(long chatId) {
        return activeDrafts.get(chatId);
    }

    public void startDraft(long chatId) {
        activeDrafts.put(chatId, new TaskDraftSession(TaskCreationState.AWAITING_TITLE));
    }

    public void clearDraft(long chatId) {
        activeDrafts.remove(chatId);
    }
}
