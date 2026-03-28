package com.finsight.marketrealtime.dto;

import lombok.Data;

@Data
public class LoginDto {
        private String userId;
        private String username;
        private String email;
        private String password;
        private String phoneNumber;
        private boolean isAdmin;
        private String stockId;
}
