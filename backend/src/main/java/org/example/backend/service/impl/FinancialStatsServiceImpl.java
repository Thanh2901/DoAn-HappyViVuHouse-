package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.response.FinancialStatsResponse;
import org.example.backend.dto.response.FinancialStatsResponse.TransactionStatusCount;
import org.example.backend.enums.TransactionStatus;
import org.example.backend.model.Transaction;
import org.example.backend.repository.TransactionRepository;
import org.example.backend.service.FinancialStatsService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialStatsServiceImpl implements FinancialStatsService {

    private final TransactionRepository transactionRepository;

    @Override
    public FinancialStatsResponse getFinancialStats(Pageable pageable) {
        log.info("Fetching financial statistics with pageable: {}", pageable);

        // Tính tổng doanh thu (totalAmount) từ các giao dịch SUCCESS
        BigDecimal totalRevenue = transactionRepository.findAllByStatus(TransactionStatus.SUCCESS, pageable)
                .stream()
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính tổng phí admin từ các giao dịch SUCCESS
        BigDecimal totalAdminFee = transactionRepository.findAllByStatus(TransactionStatus.SUCCESS, pageable)
                .stream()
                .map(Transaction::getAdminFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Đếm số lượng giao dịch theo trạng thái
        List<TransactionStatusCount> statusCounts = Arrays.stream(TransactionStatus.values())
                .map(status -> {
                    TransactionStatusCount countObj = new TransactionStatusCount();
                    countObj.setStatus(status); // Sử dụng setter trực tiếp
                    countObj.setCount(transactionRepository.countByStatus(status)); // Gọi countByStatus với tham số
                    return countObj;
                })
                .collect(Collectors.toList());

        FinancialStatsResponse response = new FinancialStatsResponse();
        response.setTotalRevenue(totalRevenue);
        response.setTotalAdminFee(totalAdminFee);
        response.setStatusCounts(statusCounts);

        log.info("Financial stats calculated - Total Revenue: {}, Total Admin Fee: {}, Status Counts: {}",
                totalRevenue, totalAdminFee, statusCounts);
        return response;
    }
}