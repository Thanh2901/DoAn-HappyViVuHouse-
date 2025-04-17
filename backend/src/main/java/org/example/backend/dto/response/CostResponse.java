package org.example.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostResponse {
    private String name;
    private BigDecimal cost;
}
