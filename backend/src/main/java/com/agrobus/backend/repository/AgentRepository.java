package com.agrobus.backend.repository;

import com.agrobus.backend.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AgentRepository extends JpaRepository<Agent, Long> {
    List<Agent> findByStatus(Agent.Status status);
    List<Agent> findByAssignedDistrict(String district);
    long countByStatus(Agent.Status status);
}
