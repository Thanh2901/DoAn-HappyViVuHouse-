package org.example.backend.service.impl;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.service.UploadMinIOService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Files;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadMinIOServiceImpl implements UploadMinIOService {
    private final MinioClient minioClient;

    private static final Map<String, String> MIME_TYPES = new HashMap<>();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    static {
        MIME_TYPES.put("jpg", "image/jpeg");
        MIME_TYPES.put("jpeg", "image/jpeg");
        MIME_TYPES.put("png", "image/png");
        MIME_TYPES.put("gif", "image/gif");
        MIME_TYPES.put("bmp", "image/bmp");
        MIME_TYPES.put("mp4", "video/mp4");
        MIME_TYPES.put("mov", "video/quicktime");
        MIME_TYPES.put("avi", "video/x-msvideo");
        MIME_TYPES.put("mp3", "audio/mpeg");
        MIME_TYPES.put("wav", "audio/wav");
        MIME_TYPES.put("pdf", "application/pdf");
        MIME_TYPES.put("doc", "application/msword");
        MIME_TYPES.put("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        MIME_TYPES.put("xls", "application/vnd.ms-excel");
        MIME_TYPES.put("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        MIME_TYPES.put("txt", "text/plain");
        MIME_TYPES.put("csv", "text/csv");
        MIME_TYPES.put("zip", "application/zip");
        MIME_TYPES.put("rar", "application/x-rar-compressed");
        MIME_TYPES.put("json", "application/json");
        MIME_TYPES.put("xml", "application/xml");
        MIME_TYPES.put("ts", "video/mp2t");
        MIME_TYPES.put("m3u8", "application/vnd.apple.mpegurl");
    }

    @Override
    public String uploadFile(File file, String objectName, String bucketName, String cameraName) {
        try {
            ensureBucketExists(bucketName);

            if (file.length() == 0) {
                throw new IllegalArgumentException("File is empty: " + file.getAbsolutePath());
            }

            // tạo đường dẫn với cameraName và datePrefix
            String datePrefix = getDatePrefix();
            String newObjectName = String.format("%s/%s/%s", cameraName, datePrefix, objectName);

            String fileUrl = uploadFileToBucket(file, newObjectName, bucketName);
            log.info("File uploaded successfully: {}", fileUrl);
            return fileUrl;
        } catch (Exception e) {
            log.error("Failed to upload file {}: {}", objectName, e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to MinIO", e);
        }
    }

    @Override
    public String uploadVideoToBucket(File file, String objectName, String bucketName, String cameraName) throws Exception {
        if (!objectName.toLowerCase().endsWith(".mp4")) {
            objectName += ".mp4";
        }

        String datePrefix = getDatePrefix();
        String newObjectName = String.format("%s/%s/%s", cameraName, datePrefix, objectName);

        String contentType = "video/mp4";

        if (!file.exists() || file.length() == 0) {
            throw new IllegalArgumentException("Video file is invalid or empty: " + file.getAbsolutePath());
        }

        try (FileInputStream inputStream = new FileInputStream(file)) {
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", contentType);
            headers.put("X-Content-Type-Options", "nosniff");

            PutObjectArgs args = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(newObjectName)
                    .stream(inputStream, file.length(), -1)
                    .contentType(contentType)
                    .headers(headers)
                    .build();

            minioClient.putObject(args);
            log.info("Video file uploaded successfully: {}/{} ({} bytes)", bucketName, newObjectName, file.length());
        }

        return String.format("%s/%s", bucketName, newObjectName);
    }

    @Override
    public String uploadVideoBytes(byte[] videoBytes, String objectName, String bucketName, String cameraName) throws Exception {
        ensureBucketExists(bucketName);

        if (!objectName.toLowerCase().endsWith(".mp4")) {
            objectName += ".mp4";
        }

        String datePrefix = getDatePrefix();
        String newObjectName = String.format("%s/%s/%s", cameraName, datePrefix, objectName);

        if (videoBytes == null || videoBytes.length == 0) {
            throw new IllegalArgumentException("Video data is empty");
        }

        String contentType = "video/mp4";
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", contentType);
        headers.put("X-Content-Type-Options", "nosniff");

        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(videoBytes)) {
            PutObjectArgs args = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(newObjectName)
                    .stream(inputStream, videoBytes.length, -1)
                    .contentType(contentType)
                    .headers(headers)
                    .build();

            minioClient.putObject(args);

            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(newObjectName)
                            .build()
            );

            log.info("Video bytes uploaded successfully: {}/{} ({} bytes, etag: {})",
                    bucketName, newObjectName, videoBytes.length, stat.etag());
        } catch (Exception e) {
            log.error("Failed to upload video bytes {}: {}", newObjectName, e.getMessage(), e);
            throw new RuntimeException("Failed to upload video bytes to MinIO", e);
        }

        return String.format("%s/%s", bucketName, newObjectName);
    }

    private void ensureBucketExists(String bucketName) throws Exception {
        boolean bucketExists = minioClient.bucketExists(
                BucketExistsArgs.builder()
                        .bucket(bucketName)
                        .build()
        );
        if (!bucketExists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder()
                            .bucket(bucketName)
                            .build()
            );
            log.info("Created bucket: {}", bucketName);
        }
    }

    private String uploadFileToBucket(File file, String objectName, String bucketName) throws Exception {
        String contentType = getContentType(file);

        if (objectName.toLowerCase().endsWith(".mp4")) {
            contentType = "video/mp4";
        }

        try (FileInputStream inputStream = new FileInputStream(file)) {
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", contentType);

            if (contentType.startsWith("video/")) {
                headers.put("X-Content-Type-Options", "nosniff");
            }

            PutObjectArgs.Builder argsBuilder = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(inputStream, file.length(), -1)
                    .contentType(contentType)
                    .headers(headers);

            minioClient.putObject(argsBuilder.build());
            log.info("File uploaded successfully: {}/{} ({} bytes, type: {})",
                    bucketName, objectName, file.length(), contentType);
        }
        return String.format("%s/%s", bucketName, objectName);
    }

    private String getContentType(File file) {
        try {
            String contentType = Files.probeContentType(file.toPath());
            if (contentType != null) {
                return contentType;
            }

            String fileName = file.getName().toLowerCase();
            int lastDot = fileName.lastIndexOf('.');

            if (lastDot > 0) {
                String extension = fileName.substring(lastDot + 1);
                return MIME_TYPES.getOrDefault(extension, "application/octet-stream");
            }

            return "application/octet-stream";
        } catch (Exception e) {
            log.warn("Failed to determine content type for file {}: {}", file.getName(), e.getMessage());
            return "application/octet-stream";
        }
    }

    private String getDatePrefix() {
        return LocalDate.now().format(DATE_FORMATTER);
    }
}