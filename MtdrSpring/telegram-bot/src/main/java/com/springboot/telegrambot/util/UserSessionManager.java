package com.springboot.telegrambot.util;

import com.springboot.telegrambot.client.BackendServiceClient;
import com.springboot.telegrambot.dto.UserSessionDTO;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserSessionManager {

    private final BackendServiceClient backendServiceClient;
    
    private final Map<String, UserSessionDTO> activeSessions = new ConcurrentHashMap<>();

    public UserSessionManager(BackendServiceClient backendServiceClient) {
        this.backendServiceClient = backendServiceClient;
    }

    public UserSessionDTO getOrCreateSession(String telegramUserId) {
        if (telegramUserId == null) return null;

        // 1. Check cache first (Instant O(1) lookup)
        if (activeSessions.containsKey(telegramUserId)) {
            return activeSessions.get(telegramUserId);
        }

        // 2. Cache miss: Fetch from backend
        try {
            UserSessionDTO userInfo = backendServiceClient.getUserDataByTelegramId(telegramUserId);
            if (userInfo != null) {
                activeSessions.put(telegramUserId, userInfo);
                return userInfo;
            }
        } catch (Exception e) {
            // Log error
        }
        return null; // User not registered
    }
}