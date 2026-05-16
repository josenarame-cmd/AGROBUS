package com.agrobus.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String fullName;

    @NotBlank
    @Column(unique = true)
    private String nationalId;

    @NotBlank
    @Column(unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @NotBlank
    private String district;

    private String sector;

    private Double farmSize;

    private String cropType;

    private Integer creditScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @Column(updatable = false)
    private LocalDateTime registrationDate;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        registrationDate = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = Status.ACTIVE;
        if (creditScore == null) creditScore = 500;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Gender { MALE, FEMALE, OTHER }
    public enum Status { ACTIVE, INACTIVE }
}
