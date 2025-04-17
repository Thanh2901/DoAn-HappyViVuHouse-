package org.example.backend.dto.request;

import lombok.Data;

@Data
public class RequestRequest {
    private String description;
    private String nameOfRent;
    private Long roomId;
    private String phone;
}
