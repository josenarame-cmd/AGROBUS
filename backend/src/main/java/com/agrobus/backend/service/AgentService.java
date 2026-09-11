package com.agrobus.backend.service;

import com.agrobus.backend.entity.Agent;
import com.agrobus.backend.entity.Farmer;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.AgentRepository;
import com.agrobus.backend.repository.FarmerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;
    private final FarmerRepository farmerRepository;

    @Transactional
    public Agent createAgent(Agent agent) {
        return agentRepository.save(agent);
    }

    @Transactional
    public Agent updateAgent(Long id, Agent agentDetails) {
        Agent agent = getAgentById(id);
        agent.setFullName(agentDetails.getFullName());
        agent.setPhone(agentDetails.getPhone());
        agent.setAssignedDistrict(agentDetails.getAssignedDistrict());
        agent.setStatus(agentDetails.getStatus());
        return agentRepository.save(agent);
    }

    @Transactional
    public void deleteAgent(Long id) {
        if (!agentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Agent not found with id: " + id);
        }
        agentRepository.deleteById(id);
    }

    /** Returns agent with assignedFarmers eagerly loaded (no LazyInitializationException). */
    public Agent getAgentById(Long id) {
        return agentRepository.findByIdWithFarmers(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + id));
    }

    /** Returns all agents with assignedFarmers eagerly loaded. */
    public List<Agent> getAllAgents() {
        return agentRepository.findAllWithFarmers();
    }

    @Transactional
    public Agent assignFarmer(Long agentId, Long farmerId) {
        Agent agent = getAgentById(agentId);
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with id: " + farmerId));
        farmer.setAgent(agent);
        farmerRepository.save(farmer);
        return agentRepository.findByIdWithFarmers(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + agentId));
    }

    public List<Farmer> getAssignedFarmers(Long agentId) {
        return farmerRepository.findByAgentId(agentId);
    }
}
