package com.springboot.MyTodoList.web.features.role;

import com.springboot.MyTodoList.web.exception.customExtensions.ResourceNotFoundException;
import com.springboot.MyTodoList.web.features.permission.Permission;
import com.springboot.MyTodoList.web.features.permission.PermissionService;
import com.springboot.MyTodoList.web.features.role.dto.RoleCreationRequestDTO;
import com.springboot.MyTodoList.web.features.role.dto.RoleResponseDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RoleService {

    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);


    private final RoleRepository roleRepository;
    private final PermissionService permissionService;

    public Role createRole(RoleCreationRequestDTO request) {

        String sanitizedName = HtmlUtils.htmlEscape(request.name());
        String sanitizedDescription = HtmlUtils.htmlEscape(request.description());

        if (roleRepository.existsByName(sanitizedName)) {
            throw new IllegalArgumentException("Role with name " + sanitizedName + " already exists.");
        }

        if (request.cosmetic()) {
            return roleRepository.save(new Role(sanitizedName, sanitizedDescription, true));
        }

        Role newRole = new Role(sanitizedName, sanitizedDescription);

        for (String permissionName : request.permissions()) {
            Permission permission = permissionService.getPermissionByName(permissionName)
                    .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + permissionName));
            newRole.addPermission(permission);
        }


        return roleRepository.save(newRole);
    }


    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }

    public Optional<Role> findRoleByName(String name) {
        return roleRepository.findByName(name);
    }

    public List<RoleResponseDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RoleResponseDTO convertToDTO(Role role) {
        if (role == null) {
            return null;
        }

        // Convert roles to set of role names
        Set<String> permissions = role.getPermissions().stream()
                .map(Permission::getName)
                .collect(Collectors.toSet());

        return new RoleResponseDTO(
                role.getRoleId(),
                HtmlUtils.htmlEscape(role.getName()),
                HtmlUtils.htmlEscape(role.getDescription()),
                permissions,
                role.isCosmetic()
        );
    }

    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }


    public void addPermissionToRole(String roleName, String permissionName) {
        Role role = findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));

        if (role.isSystemProtected()) {
            throw new IllegalStateException("System role '" + role.getName() + "' cannot be modified");
        }

        Permission permissionToAdd = permissionService.getPermissionByName(permissionName)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found: " + permissionName));

        // Don't add if role already has it
        if (role.getPermissions().contains(permissionToAdd)) {
            return;
        }

        // Avoid adding ADMIN_OVERRIDE
        permissionService.getPermissionByName("ADMIN_OVERRIDE")
                .filter(adminOverride -> adminOverride.equals(permissionToAdd))
                .ifPresent(p -> {
                    // Skip silently or throw depending on policy
                    return;
                });

        logger.info("Adding permission '{}' to role '{}'", permissionToAdd.getName(), role.getName());
        role.addPermission(permissionToAdd);
        saveRole(role);
    }


    public void removePermissionFromRole(String roleName, Permission permission) {
        Optional<Role> roleOpt = findByName(roleName);
        if (roleOpt.isPresent()) {
            if (roleOpt.get().isSystemProtected()) {
                throw new IllegalStateException("System role 'ADMIN' cannot be modified");
            }
            Role role = roleOpt.get();
            role.removePermission(permission);
            saveRole(role);
        }
    }

    @Transactional
    public String deleteRoleById(Long roleId) {
        if (roleId == null) {
            throw new IllegalArgumentException("Role ID cannot be null");
        }
        if (!roleRepository.existsById(roleId)) {
            throw new IllegalArgumentException("Role with ID " + roleId + " does not exist");
        }

        Role role = roleRepository.getByRoleId(roleId);

        if (role.isSystemProtected()) {
            throw new IllegalStateException("System role 'ADMIN' cannot be deleted");
        }
        String roleName = role.getName();
        roleRepository.delete(role);
        return roleName;

    }

}

