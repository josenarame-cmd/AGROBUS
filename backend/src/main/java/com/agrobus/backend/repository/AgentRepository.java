package com.agrobus.backend.repository;

import com.agrobus.backend.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AgentRepository extends JpaRepository<Agent, Long> {

    /** Eagerly fetch assignedFarmers to avoid LazyInitializationException in JSON serialization. */
    @Query("SELECT DISTINCT a FROM Agent a LEFT JOIN FETCH a.assignedFarmers")
    List<Agent> findAllWithFarmers();

    @Query("SELECT a FROM Agent a LEFT JOIN FETCH a.assignedFarmers WHERE a.id = :id")
    Optional<Agent> findByIdWithFarmers(Long id);

    List<Agent> findByStatus(Agent.Status status);
    List<Agent> findByAssignedDistrict(String district);
    long countByStatus(Agent.Status status);
}
