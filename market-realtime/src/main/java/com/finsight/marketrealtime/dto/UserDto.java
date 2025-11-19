package com.finsight.marketrealtime.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserDto {
    private UUID userId;
    private String username;
    private String email;
    private String password;
    private String phoneNumber;
    private boolean isAdmin;
}
