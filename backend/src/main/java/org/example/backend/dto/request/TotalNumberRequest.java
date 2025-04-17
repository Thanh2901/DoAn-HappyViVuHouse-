package org.example.backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TotalNumberRequest {
    private Integer numberOfRoom;
    private Integer numberOfPeople;
    private Integer numberOfEmptyRoom;
    private BigDecimal revenue;
}
