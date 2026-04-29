package com.springboot.MyTodoList.web.features.summaryjob;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SummaryJobRepository extends JpaRepository<SummaryJob, Long> {
}
