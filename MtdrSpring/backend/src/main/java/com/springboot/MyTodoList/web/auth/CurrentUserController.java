package com.springboot.MyTodoList.web.auth;

import com.springboot.MyTodoList.web.auth.dto.UserAuthResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CurrentUserController {

    private final AuthService authService;

    public CurrentUserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserAuthResponseDTO> getCurrentUser(Authentication authentication) {
        return authService.getCurrentUserAuth(authentication);
    }
}