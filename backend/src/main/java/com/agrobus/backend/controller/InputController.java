package com.agrobus.backend.controller;

import com.agrobus.backend.entity.AgriculturalInput;
import com.agrobus.backend.service.InputService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inputs")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public class InputController {

    private final InputService inputService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<AgriculturalInput> createInput(@Valid @RequestBody AgriculturalInput input) {
        return ResponseEntity.ok(inputService.createInput(input));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<AgriculturalInput> updateInput(@PathVariable Long id, @Valid @RequestBody AgriculturalInput input) {
        return ResponseEntity.ok(inputService.updateInput(id, input));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Void> deleteInput(@PathVariable Long id) {
        inputService.deleteInput(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgriculturalInput> getInput(@PathVariable Long id) {
        return ResponseEntity.ok(inputService.getInputById(id));
    }

    @GetMapping
    public ResponseEntity<List<AgriculturalInput>> getAllInputs() {
        return ResponseEntity.ok(inputService.getAllInputs());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<AgriculturalInput>> getByCategory(@PathVariable AgriculturalInput.Category category) {
        return ResponseEntity.ok(inputService.getInputsByCategory(category));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<AgriculturalInput>> getLowStockInputs() {
        return ResponseEntity.ok(inputService.getLowStockInputs());
    }

    @PostMapping("/{id}/distribute")
    public ResponseEntity<AgriculturalInput> distributeInput(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(inputService.distributeInput(id, body.get("quantity")));
    }
}
