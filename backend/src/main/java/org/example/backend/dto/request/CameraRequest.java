package org.example.backend.dto.request;

import lombok.Data;

@Data
public class CameraRequest {
    private String name;
    private String ip;
    private int port;
}
