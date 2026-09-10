package com.agrobus.backend.controller;

import com.agrobus.backend.entity.Agent;
import com.agrobus.backend.entity.Farmer;
import com.agrobus.backend.service.AgentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public class AgentController {

    private final AgentService agentService;

    @PostMapping
    public ResponseEntity<Agent> createAgent(@Valid @RequestBody Agent agent) {
        return ResponseEntity.ok(agentService.createAgent(agent));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Agent> updateAgent(@PathVariable Long id, @Valid @RequestBody Agent agent) {
        return ResponseEntity.ok(agentService.updateAgent(id, agent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agent> getAgent(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getAgentById(id));
    }

    @GetMapping
    public ResponseEntity<List<Agent>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    @PostMapping("/{agentId}/assign-farmer")
    public ResponseEntity<Agent> assignFarmer(@PathVariable Long agentId, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(agentService.assignFarmer(agentId, body.get("farmerId")));
    }

    @GetMapping("/{agentId}/farmers")
    public ResponseEntity<List<Farmer>> getAssignedFarmers(@PathVariable Long agentId) {
        return ResponseEntity.ok(agentService.getAssignedFarmers(agentId));
    }
}
