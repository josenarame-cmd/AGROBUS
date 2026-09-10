package com.agrobus.backend.controller;

import com.agrobus.backend.dto.LoanRequest;
import com.agrobus.backend.entity.Loan;
import com.agrobus.backend.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public class LoanController {

    private final LoanService loanService;

    @PostMapping
    public ResponseEntity<Loan> createLoan(@Valid @RequestBody LoanRequest request) {
        return ResponseEntity.ok(loanService.createLoan(request));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Loan> approveLoan(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.approveLoan(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Loan> rejectLoan(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(loanService.rejectLoan(id, body.get("reason")));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<Loan> markDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.markDelivered(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loan> getLoan(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getLoanById(id));
    }

    @GetMapping
    public ResponseEntity<Page<Loan>> getAllLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(loanService.getAllLoans(
                PageRequest.of(page, size, Sort.by("requestDate").descending())));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<Loan>> getLoansByStatus(
            @PathVariable Loan.LoanStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(loanService.getLoansByStatus(status,
                PageRequest.of(page, size, Sort.by("requestDate").descending())));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<Loan>> getLoansByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(loanService.getLoansByFarmer(farmerId));
    }

    @GetMapping("/recent")
    public ResponseEntity<Page<Loan>> getRecentLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(loanService.getRecentLoans(PageRequest.of(page, size)));
    }
}
