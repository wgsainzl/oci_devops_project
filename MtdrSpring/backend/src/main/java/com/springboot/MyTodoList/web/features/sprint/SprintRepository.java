package com.springboot.MyTodoList.web.features.sprint;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Integer> {
    public List<Sprint> findByTeam_TeamId(Integer teamId);
}