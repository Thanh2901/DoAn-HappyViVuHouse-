package org.example.backend.dto.response;

import lombok.Data;

@Data
public class CameraResponse {
    private Long id;
    private String name;
    private String ip;
    private int port;
}
