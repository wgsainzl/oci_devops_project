package com.springboot.MyTodoList.web.features.link;

import java.time.OffsetDateTime;

import com.springboot.MyTodoList.web.features.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "USER_LINK")
public class UserLink {
    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Setter
    @Getter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    private User user;

    @Setter
    @Getter
    @Column(name = "CODE")
    private Integer code;
    
    @Setter
    @Getter
    @Column(name = "CREATED_AT")
    private OffsetDateTime createdAt;

    @Setter
    @Getter
    @Column(name = "ACTIVE")
    private boolean active;

    public UserLink(User user, Integer code, OffsetDateTime createdAt, boolean active){
        this.user = user;
        this.code = code;
        this.active = active;
        this.createdAt = createdAt;
    }

}
