package com.springboot.MyTodoList.web.features.link;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
@Transactional
public interface UserLinkRepository extends JpaRepository<UserLink, Long> {
    Optional<UserLink> findById(Long id);
    Optional<UserLink> findByUser_UserId(Long userId);
    Optional<UserLink> findByCode(Integer code);
}
