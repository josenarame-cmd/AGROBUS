package com.agrobus.backend.service;

import com.agrobus.backend.entity.Agent;
import com.agrobus.backend.entity.Farmer;
import com.agrobus.backend.exception.ResourceNotFoundException;
import com.agrobus.backend.repository.AgentRepository;
import com.agrobus.backend.repository.FarmerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;
    private final FarmerRepository farmerRepository;

    public Agent createAgent(Agent agent) {
        return agentRepository.save(agent);
    }

    public Agent updateAgent(Long id, Agent agentDetails) {
        Agent agent = getAgentById(id);
        agent.setFullName(agentDetails.getFullName());
        agent.setPhone(agentDetails.getPhone());
        agent.setAssignedDistrict(agentDetails.getAssignedDistrict());
        agent.setStatus(agentDetails.getStatus());
        return agentRepository.save(agent);
    }

    public void deleteAgent(Long id) {
        if (!agentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Agent not found with id: " + id);
        }
        agentRepository.deleteById(id);
    }

    public Agent getAgentById(Long id) {
        return agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + id));
    }

    public List<Agent> getAllAgents() {
        return agentRepository.findAll();
    }

    public Agent assignFarmer(Long agentId, Long farmerId) {
        Agent agent = getAgentById(agentId);
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with id: " + farmerId));
        farmer.setAgent(agent);
        farmerRepository.save(farmer);
        return agentRepository.findById(agentId).get();
    }

    public List<Farmer> getAssignedFarmers(Long agentId) {
        return farmerRepository.findByAgentId(agentId);
    }
}
