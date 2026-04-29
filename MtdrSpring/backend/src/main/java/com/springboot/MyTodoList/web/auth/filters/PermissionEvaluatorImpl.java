package com.springboot.MyTodoList.web.auth.filters;

import com.springboot.MyTodoList.web.features.user.userDetails.CustomUserDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.security.access.PermissionEvaluator;

import java.io.Serializable;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component("permissionEvaluatorImpl")
public class PermissionEvaluatorImpl implements PermissionEvaluator {

    @Override
    public boolean hasPermission(Authentication auth, Object targetDomainObject, Object permission) {
        if (!(permission instanceof String)) return false;
        return hasPermission(auth, (String) permission);
    }

    @Override
    public boolean hasPermission(Authentication auth, Serializable targetId, String targetType, Object permission) {
        if (!(permission instanceof String)) return false;
        return hasPermission(auth, (String) permission);
    }



    public boolean hasPermission(Authentication auth, String permissionName) {
        Set<String> authorities = extractAuthorities(auth);
        if (authorities.isEmpty()) return false;

        if(authorities.contains("ADMIN_OVERRIDE")) return true;

        // Direct permission check
        if (authorities.contains(permissionName)) {
            return true;
        }


        // Check for MANAGE permission for the resource prefix
        String[] parts = permissionName.split("_", 2);
        if (parts.length == 2) {
            String managePermission = parts[0] + "_MANAGE";
            return authorities.contains(managePermission);
        }

        return false;
    }



    public boolean hasAnyPermission(Authentication auth, String... permissions) {
        Set<String> authorities = extractAuthorities(auth);
        if (authorities.isEmpty()) return false;
        if (authorities.contains("ADMIN_OVERRIDE")) return true;

        for (String permission : permissions) {
            if (authorities.contains(permission)) {
                return true;
            }

            String[] parts = permission.split("_", 2);
            if (parts.length == 2 && authorities.contains(parts[0] + "_MANAGE")) {
                return true;
            }
        }
        return false;
    }

    public boolean hasAllPermissions(Authentication auth, String... permissions) {
        Set<String> authorities = extractAuthorities(auth);
        if (authorities.isEmpty()) return false;
        if (authorities.contains("ADMIN_OVERRIDE")) return true;

        for (String permission : permissions) {
            if (authorities.contains(permission)) {
                continue;
            }

            String[] parts = permission.split("_", 2);
            if (parts.length == 2 && authorities.contains(parts[0] + "_MANAGE")) {
                continue;
            }

                return false;
        }
        return true;
    }

    private Set<String> extractAuthorities(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return Set.of();

        Object principal = auth.getPrincipal();
        if (!(principal instanceof CustomUserDetails userDetails)) return Set.of();

        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }
}
