package com.agrobus.backend.controller;

import com.agrobus.backend.entity.Repayment;
import com.agrobus.backend.service.RepaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/repayments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public class RepaymentController {

    private final RepaymentService repaymentService;

    @PostMapping
    public ResponseEntity<Repayment> recordRepayment(@Valid @RequestBody Repayment repayment) {
        return ResponseEntity.ok(repaymentService.recordRepayment(repayment));
    }

    @GetMapping("/loan/{loanId}")
    public ResponseEntity<List<Repayment>> getRepaymentsByLoan(@PathVariable Long loanId) {
        return ResponseEntity.ok(repaymentService.getRepaymentsByLoan(loanId));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<Repayment>> getRepaymentsByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(repaymentService.getRepaymentsByFarmer(farmerId));
    }

    @GetMapping
    public ResponseEntity<List<Repayment>> getAllRepayments() {
        return ResponseEntity.ok(repaymentService.getAllRepayments());
    }

    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getTotalRepayments() {
        return ResponseEntity.ok(repaymentService.getTotalRepayments());
    }
}
