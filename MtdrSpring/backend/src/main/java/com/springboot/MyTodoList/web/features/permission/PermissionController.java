package com.springboot.MyTodoList.web.features.permission;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping(path = "api/permissions")
public class PermissionController {


    private final PermissionService permissionService;

    @PreAuthorize("@permissionEvaluatorImpl.hasAnyPermission(authentication, 'ROLES_ASSIGN', 'ROLES_WRITE')")
    @GetMapping("/get-permissions")
    public List<String> getPermissions() {
        return permissionService.getAllPermissions();
    }


}

