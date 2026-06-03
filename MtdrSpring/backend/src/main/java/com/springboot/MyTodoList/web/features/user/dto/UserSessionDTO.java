package com.springboot.MyTodoList.web.features.user.dto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSessionDTO {
    private Long userId;
    private String telegramUserId;
    private Integer teamId;
    private String role; 
}