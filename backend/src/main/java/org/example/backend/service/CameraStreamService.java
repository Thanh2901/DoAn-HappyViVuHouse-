package org.example.backend.service;

import jakarta.servlet.http.HttpServletResponse;
import org.example.backend.dto.request.CameraRequest;
import org.example.backend.dto.response.CameraResponse;
import org.example.backend.model.CameraRecord;

import java.util.List;

public interface CameraStreamService {
    CameraResponse createCamera(CameraRequest cameraRequest);
    CameraResponse updateCamera(CameraRequest cameraRequest, Long id);
    CameraResponse getCamera(Long id);
    String deleteCamera(Long id);
//    byte[] getCameraFrame(Long cameraId);
//    void streamCamera(Long cameraId, HttpServletResponse response);
    List<CameraResponse> getCameraList();
    Boolean checkCameraStatus(Long id);
    List<CameraRecord> getRecordsByCamera(Long id);
}
