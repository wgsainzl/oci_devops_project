package com.springboot.MyTodoList.features.role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    // Allows us to find a role by name (e.g., "ROLE_ADMIN", "ROLE_DEVELOPER")
    Optional<Role> findByRoleName(String roleName);
}