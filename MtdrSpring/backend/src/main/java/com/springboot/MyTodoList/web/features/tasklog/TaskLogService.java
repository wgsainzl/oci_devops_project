package com.springboot.MyTodoList.web.features.tasklog;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskLogService {

    @Autowired
    private TaskLogRepository taskLogRepository;

    public List<Object[]> getAllTaskLogsForSummary() {
        return taskLogRepository.findAllLogsWithTaskNames();
    }
}