package com.agrobus.backend.repository;

import com.agrobus.backend.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FarmRepository extends JpaRepository<Farm, Long> {
    List<Farm> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    Optional<Farm> findByIdAndOwnerId(Long id, Long ownerId);
    long countByOwnerId(Long ownerId);
}