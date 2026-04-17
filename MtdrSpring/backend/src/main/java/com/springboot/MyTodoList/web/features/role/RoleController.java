package com.springboot.MyTodoList.web.features.role;

import com.springboot.MyTodoList.web.features.role.dto.RoleCreationRequestDTO;
import com.springboot.MyTodoList.web.features.role.dto.RoleResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.HtmlUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping(path = "api/role")
public class RoleController {


    private final RoleService roleService;

    @PreAuthorize("@permissionEvaluatorImpl.hasPermission(authentication, 'ROLES_WRITE')")
    @PostMapping("/create-role")
    // Only roles with ROLES_WRITE permission can create roles
    public ResponseEntity<RoleResponseDTO> createRole(@Valid @RequestBody RoleCreationRequestDTO request) {
        RoleResponseDTO newRole = roleService.convertToDTO(roleService.createRole(request));
        return new ResponseEntity<>(newRole, HttpStatus.CREATED);
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication,'ROLES_READ')")
    @GetMapping("/get-all-roles")
    public List<RoleResponseDTO> getAllRoles() {
        return (roleService.getAllRoles());
    }

    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'ROLES_WRITE')")
    @PostMapping("/add-permision-to-role/{roleName}/{permision}")
    public ResponseEntity<Map<String, Object>> addPermissionToRole(@PathVariable String roleName, @PathVariable String permision) {
        roleService.addPermissionToRole(roleName, permision);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Permission added successfully to role " + HtmlUtils.htmlEscape(roleName));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PreAuthorize("@permissionEvaluatorImpl.hasPermission(authentication, 'ROLES_DELETE')")
    @DeleteMapping("/delete-role/{roleId}")
    public ResponseEntity<Map<String, Object>> deleteRole(@PathVariable Long roleId) {
        String deletedRoleName = roleService.deleteRoleById(roleId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Role " + deletedRoleName + " successfully deleted");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


}

