package com.springboot.MyTodoList.web.initializers;

import com.springboot.MyTodoList.web.config.DefaultRoleConfig;
import com.springboot.MyTodoList.web.features.permission.PermissionService;
import com.springboot.MyTodoList.web.features.role.Role;
import com.springboot.MyTodoList.web.features.role.RoleService;
import com.springboot.MyTodoList.web.features.role.dto.RoleCreationRequestDTO;
import com.springboot.MyTodoList.web.initializers.list.PermissionList;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Order(1)
@Component
@RequiredArgsConstructor
public class PermissionInitializer {

    private static final Logger logger = LoggerFactory.getLogger(PermissionInitializer.class);


    private final PermissionService permissionService;
    private final RoleService roleService;

    @PostConstruct
    public void initializeDefaultPermissions() {
        createDefaultPermissions();
        assignPermissionsToRoles();
    }

    private void createDefaultPermissions() {
        for (PermissionList perm : PermissionList.values()) {
            createPermissionIfNotExists(perm.getName(), perm.getDescription(), perm.getResource(), perm.getAction());
        }
    }

    private void createPermissionIfNotExists(String name, String description, String resource, String action) {
        if (permissionService.getPermissionByName(name).isEmpty()) {
            permissionService.createPermission(name, description, resource, action);
        }
    }

    private void assignPermissionsToRoles() {
        for (DefaultRoleConfig config : DefaultRoleConfig.values()) {
            Role role = roleService.findByName(config.getName())
                    .orElseGet(() -> {
                        RoleCreationRequestDTO dto = new RoleCreationRequestDTO(
                                config.getName(),
                                config.getDescription(),
                                config.isSystemProtected()
                        );
                        return roleService.createRole(dto);
                    });

            for (String permName : config.getPermissionNames()) {
                addPermissionToRoleIfNotExists(role, permName);
            }

            role.setSystemProtected(config.isSystemProtected());
            roleService.saveRole(role);
        }
    }

    private void addPermissionToRoleIfNotExists(Role role, String permissionName) {
        if (!role.hasPermission(permissionName)) {
            permissionService.getPermissionByName(permissionName).ifPresent(permission -> {
                if (!role.getPermissions().contains(permission)) {
                    role.addPermission(permission);
                } else {
                    logger.info("ROLE ALREADY HAS PERMISSION: {}", permissionName);
                    throw new IllegalStateException("Role " + role.getName() + " already has permission " + permissionName);
                }
            });
        }
    }

}


