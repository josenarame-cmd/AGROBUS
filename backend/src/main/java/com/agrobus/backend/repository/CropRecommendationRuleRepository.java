package com.agrobus.backend.repository;

import com.agrobus.backend.entity.CropRecommendationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRecommendationRuleRepository extends JpaRepository<CropRecommendationRule, Long> {
    List<CropRecommendationRule> findByActiveTrue();
}
