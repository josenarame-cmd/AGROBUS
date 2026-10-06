package com.agrobus.backend.repository;

import com.agrobus.backend.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<Crop> findByFarmIdOrderByCreatedAtDesc(Long farmId);
    /** Farm-scoped query that also enforces ownership — safe to call directly from controller. */
    List<Crop> findByFarmIdAndOwnerIdOrderByCreatedAtDesc(Long farmId, Long ownerId);
    Optional<Crop> findByIdAndOwnerId(Long id, Long ownerId);
    long countByOwnerId(Long ownerId);
    /** Status-filtered crops for a given owner. */
    List<Crop> findByOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, Crop.CropStatus status);
}
