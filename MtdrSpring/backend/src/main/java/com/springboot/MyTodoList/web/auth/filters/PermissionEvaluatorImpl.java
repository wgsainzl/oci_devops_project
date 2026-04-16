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

        if (auth == null || !auth.isAuthenticated()) return false;

        Object principal = auth.getPrincipal();
        if (!(principal instanceof CustomUserDetails userDetails)) return false;

        Set<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());


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
        for (String permission : permissions) {
            if (hasPermission(auth, permission)) {
                return true;
            }
        }
        return false;
    }

    public boolean hasAllPermissions(Authentication auth, String... permissions) {
        for (String permission : permissions) {
            if (!hasPermission(auth, permission)) {
                return false;
            }
        }
        return true;
    }
}
