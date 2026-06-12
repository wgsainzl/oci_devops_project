package com.springboot.MyTodoList.web.features.link;

import java.security.SecureRandom;
import java.time.OffsetDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.web.features.user.UserService;
import com.springboot.MyTodoList.web.features.user.userDetails.CustomUserDetails;


@RestController
@RequestMapping("/api/link")
public class UserLinkController {
    private final UserLinkService userLinkService;
    private final SecureRandom secureRandom = new SecureRandom();
    public UserLinkController(UserLinkService userLinkService, UserService userService){
        this.userLinkService = userLinkService;
    }

    @PostMapping
    public ResponseEntity<Integer> addUserLink(@AuthenticationPrincipal CustomUserDetails userDetails){
        Long userId = userDetails.user().getUserId();
        OffsetDateTime currentTime = OffsetDateTime.now();
        int randomCode = secureRandom.nextInt(900000) + 100000; // Guarantees a 6-digit code
        boolean isActive = true;
        UserLink savedLink = userLinkService.createUserLink(userId, currentTime, randomCode, isActive);
        
        return ResponseEntity.ok(savedLink.getCode());
    }
    
}
