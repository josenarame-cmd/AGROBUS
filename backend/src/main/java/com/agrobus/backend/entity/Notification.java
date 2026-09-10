package com.agrobus.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private Long recipientId;

    private String recipientRole;

    /**
     * Stored as "is_read" in the DB. Lombok generates isRead() / setRead(),
     * which is correct for boolean fields. @JsonProperty forces the JSON key
     * to "read" (not "isRead") so the frontend receives a consistent field name.
     */
    @Column(name = "is_read", nullable = false)
    @JsonProperty("read")
    private boolean read;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        read = false;
    }

    public enum NotificationType {
        LOAN_APPROVAL, LOAN_REJECTION, REPAYMENT_REMINDER,
        INPUT_DELIVERY, SYSTEM, LOW_STOCK
    }
}
