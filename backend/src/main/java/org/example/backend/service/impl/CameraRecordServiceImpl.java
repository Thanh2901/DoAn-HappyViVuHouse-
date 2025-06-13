package org.example.backend.service.impl;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bytedeco.ffmpeg.global.avcodec;
import org.bytedeco.ffmpeg.global.avutil;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.FFmpegFrameRecorder;
import org.bytedeco.javacv.FFmpegLogCallback;
import org.bytedeco.javacv.Frame;
import org.example.backend.client.StreamingClient;
import org.example.backend.model.Camera;
import org.example.backend.model.CameraRecord;
import org.example.backend.repository.CameraRecordRepository;
import org.example.backend.repository.CameraRepository;
import org.example.backend.service.CameraRecordService;
import org.example.backend.service.UploadMinIOService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
@Slf4j
@EnableScheduling
public class CameraRecordServiceImpl implements CameraRecordService {
    private final StreamingClient streamingClient;
    private final UploadMinIOService uploadMinIOService;
    private final CameraRepository cameraRepository;
    private final CameraRecordRepository cameraRecordRepository;

    @Value("${minio.bucket.camera}")
    private String bucketName;

    private ExecutorService executor;
    private final Set<Long> failedCameras = ConcurrentHashMap.newKeySet();

    @PostConstruct
    public void init() {
        FFmpegLogCallback.set();
        avutil.av_log_set_level(avutil.AV_LOG_VERBOSE);

        Logger ffmpegLogger = Logger.getLogger("org.bytedeco.ffmpeg");
        ffmpegLogger.setLevel(Level.ALL);
        ffmpegLogger.addHandler(new java.util.logging.Handler() {
            @Override
            public void publish(java.util.logging.LogRecord record) {
                String message = record.getMessage();
                Level level = record.getLevel();
                if (level.intValue() >= Level.SEVERE.intValue()) {
                    log.error("FFmpeg: {}", message);
                } else if (level.intValue() >= Level.WARNING.intValue()) {
                    log.warn("FFmpeg: {}", message);
                } else if (level.intValue() >= Level.INFO.intValue()) {
                    log.info("FFmpeg: {}", message);
                } else {
                    log.debug("FFmpeg: {}", message);
                }
            }
            @Override
            public void flush() {}
            @Override
            public void close() throws SecurityException {}
        });

        executor = Executors.newFixedThreadPool(10);
        log.info("FFmpeg logging initialized with verbose level, ExecutorService started");
    }

    @PreDestroy
    public void shutdown() {
        if (executor != null) {
            executor.shutdown();
            try {
                if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
        log.info("ExecutorService shut down successfully");
    }

    @Scheduled(initialDelay = 60000, fixedRate = Long.MAX_VALUE)
    public void uploadStartupVideo() {
        List<Camera> activeCameras = cameraRepository.findAll().stream()
                .filter(Camera::isActive)
                .filter(camera -> !failedCameras.contains(camera.getId()))
                .toList();

        if (activeCameras.isEmpty()) {
            log.warn("No active cameras available for startup video upload. Skipping...");
            return;
        }

        for (Camera camera : activeCameras) {
            executor.submit(() -> processCameraStartup(camera));
        }
    }

    private void processCameraStartup(Camera camera) {
        try {
            log.info("Testing connection to camera {} with 10-second recording", camera.getId());
            File testFile = recordVideoFromCameraToFile(camera.getId(), 10);
            if (testFile == null || !testFile.exists()) {
                log.error("Camera {} connection test failed", camera.getId());
                failedCameras.add(camera.getId());
                return;
            }
            Files.deleteIfExists(testFile.toPath());
            log.info("Camera {} connection test successful. Proceeding with full recording.", camera.getId());

            LocalDateTime startTime = LocalDateTime.now();
            File videoFile = recordVideoFromCameraToFile(camera.getId(), 300); // 5 minutes
            LocalDateTime endTime = LocalDateTime.now();

            if (videoFile == null || !videoFile.exists() || videoFile.length() == 0) {
                log.error("Failed to record video for camera {}: file is null or empty", camera.getId());
                failedCameras.add(camera.getId());
                return;
            }

            log.info("Successfully recorded video for camera {}, file size: {} bytes", camera.getId(), videoFile.length());
            String objectName = "startup_camera_" + camera.getId() + "_" + System.currentTimeMillis() + ".mp4";
            String safeCameraName = camera.getName() != null ? camera.getName().replaceAll("[^a-zA-Z0-9-_]", "_") : "unknown_camera_" + camera.getId();
            String fileUrl = uploadMinIOService.uploadFile(videoFile, objectName, bucketName, safeCameraName);
            log.info("Startup video for camera {} uploaded successfully: {}", camera.getId(), fileUrl);

            CameraRecord record = new CameraRecord();
            record.setCamera(camera);
            record.setVideoUrl(fileUrl);
            record.setStartTime(startTime);
            record.setEndTime(endTime);
            try {
                cameraRecordRepository.save(record);
                log.info("Saved camera record for camera {} to database: {}", camera.getId(), fileUrl);
            } catch (Exception e) {
                log.error("Failed to save camera record for camera {}: {}", camera.getId(), e.getMessage());
            }

            Files.deleteIfExists(videoFile.toPath());
        } catch (Exception e) {
            log.error("Failed to process startup video for camera {}: {}", camera.getId(), e.getMessage());
            failedCameras.add(camera.getId());
        }
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void checkCameraStatus() {
        List<Camera> cameras = cameraRepository.findAll();
        for (Camera camera : cameras) {
            try {
                URL url = new URL(camera.getHttpUrl());
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(5000);
                conn.connect();
                if (conn.getResponseCode() == 200) {
                    if (failedCameras.remove(camera.getId())) {
                        log.info("Camera {} is back online", camera.getId());
                    }
                } else {
                    failedCameras.add(camera.getId());
                    log.warn("Camera {} is offline", camera.getId());
                }
            } catch (Exception e) {
                failedCameras.add(camera.getId());
                log.warn("Camera {} is offline: {}", camera.getId(), e.getMessage());
            }
        }
    }

    @CircuitBreaker(name = "cameraService", fallbackMethod = "fallbackRecord")
    public File recordVideoFromCameraToFile(Long cameraId, int durationSeconds) throws Exception {
        int maxRetries = 3;
        int retryDelayMs = 5000;
        Camera camera = null;
        FFmpegFrameGrabber grabber = null;
        FFmpegFrameRecorder recorder = null;
        File tempFile = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                camera = cameraRepository.findById(cameraId)
                        .orElseThrow(() -> new IllegalArgumentException("Camera not found with ID: " + cameraId));
                if (!camera.isActive()) {
                    throw new IllegalStateException("Camera is not active: " + camera.getName());
                }

                grabber = new FFmpegFrameGrabber(camera.getHttpUrl());
                grabber.setOption("timeout", "15000000");
                grabber.setOption("stimeout", "15000000");
                grabber.setOption("buffer_size", "65536");
                grabber.setOption("threads", "2");

                if (camera.getHttpUrl().startsWith("rtsp://")) {
                    grabber.setFormat("rtsp");
                    grabber.setOption("rtsp_transport", "tcp");
                    grabber.setOption("rtsp_flags", "prefer_tcp");
                } else if (camera.getHttpUrl().contains("mjpg") || camera.getHttpUrl().contains("mjpeg")) {
                    grabber.setFormat("mjpeg");
                } else {
                    grabber.setOption("re", "");
                }

                log.info("Starting grabber for camera {} (attempt {}/{}): URL={}",
                        camera.getName(), attempt, maxRetries, camera.getHttpUrl());
                grabber.start();

                log.info("Grabber started for camera {}: width={}, height={}, frameRate={}",
                        camera.getName(), grabber.getImageWidth(), grabber.getImageHeight(), grabber.getFrameRate());

                if (grabber.getImageWidth() <= 0 || grabber.getImageHeight() <= 0) {
                    throw new IllegalStateException("Invalid video stream from camera: " + camera.getName());
                }

                tempFile = File.createTempFile("camera_" + cameraId + "_", ".mp4");
                log.info("Created temp file: {}", tempFile.getAbsolutePath());

                if (!tempFile.canWrite()) {
                    throw new IllegalStateException("Cannot write to temp file: " + tempFile.getAbsolutePath());
                }

                recorder = new FFmpegFrameRecorder(tempFile.getAbsolutePath(), grabber.getImageWidth(), grabber.getImageHeight());
                recorder.setPixelFormat(avutil.AV_PIX_FMT_YUV420P);
                recorder.setFormat("mp4");

                try {
                    recorder.setVideoCodec(avcodec.AV_CODEC_ID_H264);
                } catch (Exception e) {
                    log.warn("H.264 not available, falling back to libx264: {}", e.getMessage());
                    try {
                        recorder.setVideoCodecName("libx264");
                    } catch (Exception e2) {
                        log.warn("libx264 not available, falling back to mpeg4: {}", e2.getMessage());
                        recorder.setVideoCodecName("mpeg4");
                    }
                }

                double frameRate = grabber.getFrameRate() > 0 ? grabber.getFrameRate() : 25;
                recorder.setFrameRate(frameRate);
                int bitrate = grabber.getVideoBitrate() > 0 ? grabber.getVideoBitrate() : 1500000;
                recorder.setVideoBitrate(bitrate);
                recorder.setVideoOption("preset", "fast");
                recorder.setVideoOption("crf", "23");

                log.info("Starting recorder with codec: {}, format: {}, fps: {}, bitrate: {}",
                        recorder.getVideoCodecName() != null ? recorder.getVideoCodecName() : "default",
                        recorder.getFormat(), recorder.getFrameRate(), recorder.getVideoBitrate());

                recorder.start();
                log.info("Recorder started successfully");

                long startTime = System.currentTimeMillis();
                long durationMillis = durationSeconds * 1000L;
                int framesRecorded = 0;
                int framesSkipped = 0;
                int consecutiveNullFrames = 0;

                while (System.currentTimeMillis() - startTime < durationMillis) {
                    Frame frame = grabber.grabImage();
                    if (frame != null && frame.image != null) {
                        recorder.record(frame);
                        framesRecorded++;
                        consecutiveNullFrames = 0;

                        if (framesRecorded % 100 == 0) {
                            long elapsedSeconds = (System.currentTimeMillis() - startTime) / 1000;
                            log.debug("Recording progress: {} frames captured, elapsed time: {} seconds",
                                    framesRecorded, elapsedSeconds);
                        }
                    } else {
                        framesSkipped++;
                        consecutiveNullFrames++;
                        if (consecutiveNullFrames > 100) {
                            log.warn("Too many consecutive null frames ({}), possible connection issue", consecutiveNullFrames);
                            if (consecutiveNullFrames > 300) {
                                log.error("Connection to camera appears to be lost after {} null frames", consecutiveNullFrames);
                                break;
                            }
                        }
                        Thread.sleep(20);
                    }
                }

                if (tempFile.exists() && tempFile.length() > 0) {
                    log.info("Successfully recorded video for camera {}: {} frames, file size: {} bytes",
                            camera.getName(), framesRecorded, tempFile.length());
                    return tempFile;
                } else {
                    throw new IllegalStateException("Recording completed but output file is empty or missing");
                }
            } catch (Exception e) {
                log.warn("Attempt {}/{} failed for camera ID {}: {}", attempt, maxRetries, cameraId, e.getMessage());
                if (attempt == maxRetries) {
                    throw e;
                }
                try {
                    Thread.sleep(retryDelayMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted during retry delay", ie);
                }
            } finally {
                if (recorder != null) {
                    try {
                        recorder.stop();
                        recorder.release();
                    } catch (Exception e) {
                        log.warn("Error closing recorder: {}", e.getMessage());
                    }
                }
                if (grabber != null) {
                    try {
                        grabber.stop();
                        grabber.release();
                    } catch (Exception e) {
                        log.warn("Error closing grabber: {}", e.getMessage());
                    }
                }
                if (tempFile != null && tempFile.exists() && tempFile.length() == 0) {
                    Files.deleteIfExists(tempFile.toPath());
                }
            }
        }
        return null;
    }

    public File fallbackRecord(Long cameraId, int durationSeconds, Throwable t) {
        log.error("Circuit breaker fallback for camera ID {}: {}", cameraId, t.getMessage());
        failedCameras.add(cameraId);
        return null;
    }

    @Override
    public byte[] recordVideoFromCamera(Long cameraId, int durationSeconds) throws Exception {
        File videoFile = null;
        try {
            LocalDateTime startTime = LocalDateTime.now();
            videoFile = recordVideoFromCameraToFile(cameraId, durationSeconds);
            LocalDateTime endTime = LocalDateTime.now();

            if (videoFile == null || !videoFile.exists()) {
                throw new IllegalStateException("Failed to record video for camera ID: " + cameraId);
            }

            Camera camera = cameraRepository.findById(cameraId)
                    .orElseThrow(() -> new IllegalArgumentException("Camera not found with ID: " + cameraId));
            String objectName = "camera_" + cameraId + "_" + System.currentTimeMillis() + ".mp4";
            String safeCameraName = camera.getName() != null ? camera.getName().replaceAll("[^a-zA-Z0-9-_]", "_") : "unknown_camera_" + cameraId;
            String fileUrl = uploadMinIOService.uploadFile(videoFile, objectName, bucketName, safeCameraName);

            CameraRecord record = new CameraRecord();
            record.setCamera(camera);
            record.setVideoUrl(fileUrl);
            record.setStartTime(startTime);
            record.setEndTime(endTime);
            try {
                cameraRecordRepository.save(record);
                log.info("Saved camera record for camera {} to database: {}", cameraId, fileUrl);
            } catch (Exception e) {
                log.error("Failed to save camera record for camera {}: {}", cameraId, e.getMessage());
            }

            return Files.readAllBytes(videoFile.toPath());
        } finally {
            if (videoFile != null && videoFile.exists()) {
                Files.deleteIfExists(videoFile.toPath());
            }
        }
    }
}