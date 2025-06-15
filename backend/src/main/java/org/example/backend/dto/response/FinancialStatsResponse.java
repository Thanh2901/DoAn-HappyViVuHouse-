package org.example.backend.dto.response;

import lombok.Data;
import lombok.Setter;
import org.example.backend.enums.TransactionStatus;

import java.math.BigDecimal;
import java.util.List;

@Data
public class FinancialStatsResponse {
    private BigDecimal totalRevenue; // Tổng doanh thu
    private BigDecimal totalAdminFee; // Tổng phí admin
    private List<TransactionStatusCount> statusCounts; // Số lượng giao dịch theo trạng thái

    @Setter
    @Data
    public static class TransactionStatusCount {
        private TransactionStatus status;
        private Long count;

    }
}