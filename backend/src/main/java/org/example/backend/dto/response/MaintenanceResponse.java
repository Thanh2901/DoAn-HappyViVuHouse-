package org.example.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaintenanceResponse {
    private Long id;
    private LocalDateTime maintenanceDate;
    private BigDecimal price;
    private LocalDateTime createAt;
    private RoomResponse room;
    private String files;
}
