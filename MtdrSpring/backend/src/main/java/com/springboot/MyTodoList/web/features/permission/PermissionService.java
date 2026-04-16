package com.springboot.MyTodoList.web.features.permission;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public List<String> getAllPermissions() {
        return permissionRepository.findAll().stream().map(Permission::getName).toList();
    }

    public Optional<Permission> getPermissionByName(String name) {
        return permissionRepository.findByName(name);
    }

    public Permission createPermission(String name, String description, String resource, String action) {
        Permission permission = new Permission(name, description, resource, action);
        return permissionRepository.save(permission);
    }
}
