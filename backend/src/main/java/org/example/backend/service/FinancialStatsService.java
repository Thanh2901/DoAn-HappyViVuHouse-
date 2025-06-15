package org.example.backend.service;

import org.example.backend.dto.response.FinancialStatsResponse;
import org.springframework.data.domain.Pageable;

public interface FinancialStatsService {
    FinancialStatsResponse getFinancialStats(Pageable pageable);
}