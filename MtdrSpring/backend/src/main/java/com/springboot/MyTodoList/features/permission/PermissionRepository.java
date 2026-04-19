package com.springboot.MyTodoList.features.permission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    // Allows us to find a permission by its name (e.g., "CREATE_TASK")
    Optional<Permission> findByName(String name);
}