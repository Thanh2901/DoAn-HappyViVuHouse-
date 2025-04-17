package org.example.backend.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ContractResponse {
    private Long id;
    private String name;
    private String files;
    private String nameOfRent;
    private LocalDateTime deadlineContract;
    private RoomResponse room;
    private LocalDate createdAt;
    private String phone;
    private Long numOfPeople;
}
