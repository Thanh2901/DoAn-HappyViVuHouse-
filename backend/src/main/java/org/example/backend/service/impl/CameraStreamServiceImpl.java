package org.example.backend.service.impl;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.client.StreamingClient;
import org.example.backend.dto.request.CameraRequest;
import org.example.backend.dto.request.MediaSource;
import org.example.backend.dto.response.CameraResponse;
import org.example.backend.model.Camera;
import org.example.backend.model.CameraRecord;
import org.example.backend.repository.CameraRecordRepository;
import org.example.backend.repository.CameraRepository;
import org.example.backend.service.BaseService;
import org.example.backend.service.CameraStreamService;
import org.example.backend.utils.MapperUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CameraStreamServiceImpl extends BaseService implements CameraStreamService {
    private final CameraRepository cameraRepository;
    private final MapperUtils mapperUtils;
    private final StreamingClient streamingClient;
    private final CameraRecordRepository cameraRecordRepository;
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

    @PostConstruct
    private void init() {
        log.info("Starting CameraStreamServiceImpl initialization");
        startUpCamera();
        log.info("Completed CameraStreamServiceImpl initialization");
    }

    private void startUpCamera() {
        List<Camera> cameras = cameraRepository.findAll();
        for (Camera camera : cameras) {
            if (camera.getIp() == null || camera.getRTSPUrl() == null) {
                continue;
            }
            try {
                String path = streamingClient.getPath(camera.getIp());
                if (path == null || path.isEmpty()) {
                    MediaSource mediaSource = new MediaSource(camera.getIp(), camera.getRTSPUrl());
                    streamingClient.publishingSource(mediaSource);
                } else {
                    log.info("Stream already exists for camera id={}, ip={}", camera.getId(), camera.getIp());
                }
            } catch (RuntimeException e) {
                log.warn("Failed to check stream for camera id={}, ip={}: {}. Attempting to publish anyway...",
                        camera.getId(), camera.getIp(), e.getMessage());
                try {
                    System.out.println("Publishing stream for ip (after exception): " + camera.getIp());
                    MediaSource mediaSource = new MediaSource(camera.getIp(), camera.getRTSPUrl());
                    streamingClient.publishingSource(mediaSource);
                    log.info("Published stream for camera id={}, ip={}", camera.getId(), camera.getIp());
                } catch (Exception ex) {
                    log.error("Failed to publish stream for camera id={}, ip={}: {}",
                            camera.getId(), camera.getIp(), ex.getMessage());
                }
            }
        }
    }


    @Override
    public CameraResponse createCamera(CameraRequest cameraRequest) {
        Camera camera = mapperUtils.convertToEntity(cameraRequest, Camera.class);
        Camera savedCamera = cameraRepository.save(camera);
        log.info("Đã lưu camera: id={}, name={}, httpUrl={}, rtspUrl={}",
                savedCamera.getId(), savedCamera.getName(), savedCamera.getHttpUrl(), savedCamera.getRTSPUrl());
        try {
            MediaSource mediaSource = new MediaSource(savedCamera.getIp(), savedCamera.getRTSPUrl());
            streamingClient.publishingSource(mediaSource);
            log.info("Đã publish stream cho camera {}: {}", savedCamera.getId(), savedCamera.getRTSPUrl());

            executorService.submit(() -> {
                try {
                    log.info("Successfully started recording for new camera id={}", savedCamera.getId());
                } catch (Exception e) {
                    log.error("Failed to start recording for new camera id={}: {}", savedCamera.getId(), e.getMessage(), e);
                }
            });
        } catch (Exception e) {
            log.warn("Lỗi khi publish stream hoặc ghi hình cho camera {}: {}", savedCamera.getId(), e.getMessage());
        }

        return mapperUtils.convertToResponse(savedCamera, CameraResponse.class);
    }

    @Override
    @Transactional
    public CameraResponse updateCamera(CameraRequest cameraRequest, Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Camera id not found"));

        if (!streamingClient.getPath(camera.getIp()).isEmpty()) {
            streamingClient.deletePath(camera.getIp());
        }

        camera.setIp(cameraRequest.getIp());
        camera.setName(cameraRequest.getName());
        camera.setPort(cameraRequest.getPort());
        camera.setActive(true);
        Camera updatedCamera = cameraRepository.save(camera);
        log.info("Đã cập nhật camera id={}", updatedCamera.getId());

        try {
            MediaSource mediaSource = new MediaSource(updatedCamera.getIp(), updatedCamera.getRTSPUrl());
            streamingClient.publishingSource(mediaSource);
        } catch (Exception e) {
            log.warn("Lỗi khi publish stream cho camera {}: {}", updatedCamera.getId(), e.getMessage());
        }

        return mapperUtils.convertToResponse(updatedCamera, CameraResponse.class);
    }

    @Override
    public CameraResponse getCamera(Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Camera id not found"));
        return mapperUtils.convertToResponse(camera, CameraResponse.class);
    }

    @Override
    public List<CameraResponse> getCameraList() {
        List<Camera> cameras = cameraRepository.findCameraByUserId(getUserId());
        return mapperUtils.convertToResponseList(cameras, CameraResponse.class);
    }

    @Override
    public Boolean checkCameraStatus(Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Camera id not found"));
        return streamingClient.checkCameraStatus(camera.getIp());
    }

    @Override
    public List<CameraRecord> getRecordsByCamera(Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Camera id not found"));
        return cameraRecordRepository.findByCamera(camera);
    }

    @Override
    public String deleteCamera(Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Camera id not found"));
        List<CameraRecord> records = cameraRecordRepository.findByCamera(camera);
        if (!records.isEmpty()) {
            cameraRecordRepository.deleteAll(records);
            log.info("Đã xóa {} bản ghi liên quan của camera id={}", records.size(), id);
        }
        cameraRepository.delete(camera);
        if (!streamingClient.getPath(camera.getIp()).isEmpty()) {
            streamingClient.deletePath(camera.getIp());
        }
        log.info("Đã dừng ghi hình và xóa camera {}", id);
        return "Đã xóa camera " + id;
    }

    @PreDestroy
    public void shutdown() {
        executorService.shutdown();
        log.info("ExecutorService shut down");
    }
}