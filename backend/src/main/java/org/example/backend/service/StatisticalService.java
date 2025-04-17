package org.example.backend.service;

import org.example.backend.dto.request.TotalNumberRequest;
import org.example.backend.dto.response.CostResponse;
import org.example.backend.dto.response.RevenueResponse;
import org.example.backend.dto.response.TotalNumberResponse;
import org.springframework.data.domain.Page;

public interface StatisticalService {
    TotalNumberRequest getNumberOfRentalerForStatistical();

    TotalNumberResponse getStatisticalNumberOfAdmin();

    Page<RevenueResponse> getByMonth();

    Page<CostResponse> getByCost();
}
