package com.springboot.MyTodoList.web.auth;

import com.springboot.MyTodoList.web.auth.dto.UserAuthResponseDTO;
import com.springboot.MyTodoList.web.auth.oci.OciIdentityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OciIdentityService ociIdentityService;
    private final AuthService authService;

    public AuthController(OciIdentityService ociIdentityService, AuthService authService) {
        this.ociIdentityService = ociIdentityService;
        this.authService = authService;
    }

    @PreAuthorize("@permissionEvaluatorImpl.hasPermission(authentication, 'USER_WRITE')")
    @PostMapping("/invite")
    public ResponseEntity<String> invite(@RequestParam String email,
                                         @RequestParam String first,
                                         @RequestParam String last) {
        try {
            ociIdentityService.inviteUser(email, first, last);
            return ResponseEntity.ok("Invitation sent and user assigned to group.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserAuthResponseDTO> getCurrentUser(Authentication authentication) {
        return authService.getCurrentUserAuth(authentication);
    }
}
