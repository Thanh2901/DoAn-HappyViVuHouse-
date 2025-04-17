package org.example.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RevenueResponse {
    private Integer month;
    private BigDecimal revenue;
    private BigDecimal waterCost;
    private BigDecimal publicElectricCost;
    private BigDecimal internetCost;
}
