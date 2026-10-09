package com.agrobus.backend.repository;

import com.agrobus.backend.entity.SoilAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoilAnalysisRepository extends JpaRepository<SoilAnalysis, Long> {
    List<SoilAnalysis> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
}
