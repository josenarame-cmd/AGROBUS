package com.agrobus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UserProfileDTO {
    private Long userId;
    private String email;
    private String fullName;
    private String phone;
    private String pictureUrl;
    private String role;
    private boolean active;
}