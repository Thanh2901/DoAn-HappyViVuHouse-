package org.example.backend.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CameraRecordRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
