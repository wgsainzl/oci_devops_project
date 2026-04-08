package com.springboot.MyTodoList.features.role;

import com.springboot.MyTodoList.features.permission.Permission;
import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer id;

    @Column(name = "role_name", nullable = false, unique = true)
    private String roleName;

    @Column(name = "description")
    private String description;

    @Column(name = "system_protected")
    private Boolean systemProtected; // True if this is an admin role that shouldn't be deleted

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions;

    public Role() {
    }

    // Convenience constructor for fields managed by the application
    public Role(String roleName, String description, Boolean systemProtected, Set<Permission> permissions) {
        this.roleName = roleName;
        this.description = description;
        this.systemProtected = systemProtected;
        this.permissions = permissions;
    }

    // --- GETTERS & SETTERS ---

    public Integer getId() {
        return id;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getSystemProtected() {
        return systemProtected;
    }

    public void setSystemProtected(Boolean systemProtected) {
        this.systemProtected = systemProtected;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<Permission> permissions) {
        this.permissions = permissions;
    }
    
    // --- HELPER METHODS ---
    
    // Optional: It is often a good practice to include helper methods to manage collections safely
    public void addPermission(Permission permission) {
        this.permissions.add(permission);
    }

    public void removePermission(Permission permission) {
        this.permissions.remove(permission);
    }
}