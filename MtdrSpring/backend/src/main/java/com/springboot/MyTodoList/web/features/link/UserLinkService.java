package com.springboot.MyTodoList.web.features.link;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.springboot.MyTodoList.web.features.user.User;
import com.springboot.MyTodoList.web.features.user.UserService;

import jakarta.transaction.Transactional;

@Service
public class UserLinkService {
    private final UserLinkRepository userLinkRepository;
    private final UserService userService;

    public UserLinkService(UserLinkRepository userLinkRepository, UserService userService){
        this.userLinkRepository = userLinkRepository;
        this.userService = userService;
    }

    public Optional<UserLink> getUserLinkById(Long id){
        return userLinkRepository.findById(id);
    }

    public UserLink createUserLink(Long userId, OffsetDateTime currentTime, Integer randomCode, boolean isActive){
        User user = userService.getUserOptionalById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + userId));
        return userLinkRepository.save(new UserLink(user, randomCode, currentTime, isActive));
    }

    @Transactional
    public boolean linkTelegramId(Integer code, String telegramId) {
        Optional<UserLink> userLinkOpt = userLinkRepository.findByCode(code);
        if (userLinkOpt.isEmpty()) {
            return false;
        }

        UserLink userLink = userLinkOpt.get();
        if (!userLink.isActive() || userLink.getCreatedAt().isBefore(OffsetDateTime.now().minusMinutes(15))) {
            return false;
        }

        try {
            userService.updateTelegramId(userLink.getUser(), telegramId);
            userLink.setActive(false);
            userLinkRepository.save(userLink); 
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
