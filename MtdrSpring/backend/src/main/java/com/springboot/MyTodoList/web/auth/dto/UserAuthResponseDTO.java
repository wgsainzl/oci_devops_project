package com.springboot.MyTodoList.web.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthResponseDTO {
    private UserInfo user;
    private List<String> effectivePermissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String userId;
        private String email;
        private String name;
        private String ociSubjectID;
        private String telegramUserID;
        private List<String> roles;
    }

}