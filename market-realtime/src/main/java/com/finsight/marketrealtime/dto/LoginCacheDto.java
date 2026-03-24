package com.finsight.marketrealtime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginCacheDto {
    private long userId;
    private String username;
    private String email;
    private String phoneNumber;
    private String passwordHash;
    private boolean admin;
}
