package org.example.backend.service;

public interface CameraRecordService {
    byte[] recordVideoFromCamera(Long cameraId, int durationSeconds) throws Exception;
}
