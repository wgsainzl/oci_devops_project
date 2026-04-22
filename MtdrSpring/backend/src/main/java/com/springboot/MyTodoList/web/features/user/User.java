package com.springboot.MyTodoList.web.features.user;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.springboot.MyTodoList.web.features.role.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "USERS")
@NoArgsConstructor
public class User {
    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    Long userId;

    @Setter
    @Getter
    @Column(name = "name")
    String name;

    @Setter
    @Getter
    @Column(name = "email")
    String email;

    @Getter
    @Column(name = "oci_subject_id")
    String ociSubjectID;

    @Setter
    @Getter
    @Column(name = "telegram_user_id")
    String telegramUserID;


    @Setter
    @Getter
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    @JsonManagedReference
    private Set<Role> roles = new HashSet<>();

    public User(String name, String email, String ociSubjectID) {
        this.name = name;
        this.email = email;
        this.ociSubjectID = ociSubjectID;
    }


    @Override
    public String toString() {
        return name;
    }
}