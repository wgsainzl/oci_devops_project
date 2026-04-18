package com.springboot.MyTodoList.web.auth;

import com.springboot.MyTodoList.web.auth.dto.UserAuthResponseDTO;
import com.springboot.MyTodoList.web.features.role.Role;
import com.springboot.MyTodoList.web.features.user.userDetails.CustomUserDetails;
import com.springboot.MyTodoList.web.initializers.list.PermissionList;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {
    public ResponseEntity<UserAuthResponseDTO> getCurrentUserAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        UserAuthResponseDTO response = UserAuthResponseDTO.builder()
                .user(mapToUserInfo(userDetails))
                .effectivePermissions(getEffectivePermissions(userDetails))
                .build();

        return ResponseEntity.ok(response);
    }

    private UserAuthResponseDTO.UserInfo mapToUserInfo(CustomUserDetails userDetails) {
        var user = userDetails.user(); // Access the entity from the record

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return UserAuthResponseDTO.UserInfo.builder()
                .userId(user.getUserId().toString())
                .email(user.getEmail())
                .name(user.getName())
                .roles(roleNames)
                .ociSubjectID(user.getOciSubjectID())
                .telegramUserID(user.getTelegramUserID())
                .build();
    }

    private List<String> getEffectivePermissions(CustomUserDetails userDetails) {
        Set<String> granted = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_")) // Skip roles
                .collect(Collectors.toSet());

        Set<String> effectivePermissions = new HashSet<>();

        // If user has ADMIN_OVERRIDE, return all permissions
        if (granted.contains("ADMIN_OVERRIDE")) {
            return Arrays.stream(PermissionList.values())
                    .map(PermissionList::getName)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
        }

        for (String permission : granted) {
            effectivePermissions.add(permission);

            // Handle *_MANAGE permissions
            if (permission.endsWith("_MANAGE")) {
                String resource = permission.replace("_MANAGE", "");

                effectivePermissions.add(resource + "_READ");
                effectivePermissions.add(resource + "_WRITE");
                effectivePermissions.add(resource + "_DELETE");
            }
        }

        return effectivePermissions.stream().sorted().collect(Collectors.toList());
    }
}