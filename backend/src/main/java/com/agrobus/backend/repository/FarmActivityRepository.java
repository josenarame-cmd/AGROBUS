package com.agrobus.backend.repository;

import com.agrobus.backend.entity.FarmActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmActivityRepository extends JpaRepository<FarmActivity, Long> {
    List<FarmActivity> findByCropIdOrderByActivityDateDesc(Long cropId);

    /** All activities for crops belonging to a specific farm — for intelligence summaries. */
    @Query("SELECT a FROM FarmActivity a WHERE a.crop.farm.id = :farmId ORDER BY a.activityDate DESC")
    List<FarmActivity> findByFarmIdOrderByActivityDateDesc(Long farmId);
}
