package com.agrobus.backend.dto;

import com.agrobus.backend.entity.Farmer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Full farmer profile returned to an authenticated FARMER user from
 * GET /api/farmer/profile. Exposes field-level data the farmer is allowed
 * to see about their own record (no internal flags or admin-only fields).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerProfileDTO {

    private Long farmerId;
    private String fullName;
    private String nationalId;
    private String phone;
    private Farmer.Gender gender;
    private String district;
    private String sector;
    private Double farmSize;
    private String cropType;
    private Integer creditScore;
    private Farmer.Status status;
    private LocalDateTime registrationDate;
}
