package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.CameraRequest;
import org.example.backend.dto.response.CameraResponse;
import org.example.backend.model.Camera;
import org.example.backend.model.CameraRecord;
import org.example.backend.service.CameraRecordService;
import org.example.backend.service.CameraStreamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cameras")
@RequiredArgsConstructor
public class CameraController {

    private final CameraStreamService cameraService;
    private final CameraRecordService cameraRecordService;

    @PostMapping("/create")
    public ResponseEntity<CameraResponse> createCamera(@RequestBody CameraRequest cameraRequest) {
        CameraResponse cameraResponse = cameraService.createCamera(cameraRequest);
        return ResponseEntity.ok(cameraResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CameraResponse> getCameraById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(cameraService.getCamera(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CameraResponse> updateCamera(@PathVariable("id") Long id, @RequestBody CameraRequest cameraRequest) {
        return ResponseEntity.ok(cameraService.updateCamera(cameraRequest, id));
    }

    @GetMapping
    public ResponseEntity<List<CameraResponse>> getAllCameras() {
        return ResponseEntity.ok(cameraService.getCameraList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCamera(@PathVariable Long id) {
        return ResponseEntity.ok(cameraService.deleteCamera(id));
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<Boolean> checkStatusVideo(@PathVariable("id") Long id) {
        return ResponseEntity.ok(cameraService.checkCameraStatus(id));
    }

    @GetMapping("/{id}/records")
    public ResponseEntity<List<CameraRecord>> getCameraRecords(@PathVariable("id") Long id) {
        return ResponseEntity.ok(cameraService.getRecordsByCamera(id));
    }
}