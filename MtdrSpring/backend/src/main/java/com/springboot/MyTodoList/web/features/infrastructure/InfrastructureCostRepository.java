package com.springboot.MyTodoList.web.features.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InfrastructureCostRepository extends JpaRepository<InfrastructureCost, Integer> {
}