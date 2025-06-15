package org.example.backend.controller;

import org.example.backend.dto.response.FinancialStatsResponse;
import org.example.backend.service.FinancialStatsService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/financial-stats")
public class FinancialStatsController {

    private final FinancialStatsService financialStatsService;

    public FinancialStatsController(FinancialStatsService financialStatsService) {
        this.financialStatsService = financialStatsService;
    }

    @GetMapping
    public ResponseEntity<FinancialStatsResponse> getFinancialStats(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        FinancialStatsResponse stats = financialStatsService.getFinancialStats(PageRequest.of(page, size));
        return ResponseEntity.ok(stats);
    }
}