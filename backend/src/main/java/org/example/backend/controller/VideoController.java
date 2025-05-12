package org.example.backend.controller;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;
import org.example.backend.model.CameraRecord;
import org.example.backend.repository.CameraRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;

@RestController
@RequiredArgsConstructor
@RequestMapping("/playback")
public class VideoController {
    private MinioClient minioClient;
    private CameraRecordRepository cameraRecordRepository;

    @Value("${minio.bucket.camera}")
    private String bucketName;

    @GetMapping("/video/{recordId}")
    public ResponseEntity<InputStreamResource> streamVideo(
            @PathVariable Long recordId,
            @RequestHeader(value = "Range", required = false) String range) {
        try {
            // Tìm bản ghi video
            CameraRecord record = cameraRecordRepository.findById(recordId)
                    .orElseThrow(() -> new RuntimeException("Video record not found"));

            // Lấy stream từ MinIO
            GetObjectArgs getObjectArgs = GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(record.getVideoUrl())
                    .build();
            InputStream stream = minioClient.getObject(getObjectArgs);

            // Thiết lập header cho streaming
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("video/mp4"));
            headers.set("Accept-Ranges", "bytes");

            // Xử lý range request
            if (range != null) {
                // Ví dụ: Range: bytes=150000000-
                String[] ranges = range.replace("bytes=", "").split("-");
                long start = Long.parseLong(ranges[0]);
                // TODO: Lấy kích thước file từ MinIO để xử lý range chính xác
                headers.set("Content-Range", "bytes " + start + "-");
                headers.set("Content-Length", String.valueOf(Long.MAX_VALUE)); // Placeholder, cần tính chính xác
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .headers(headers)
                        .body(new InputStreamResource(stream));
            }

            // Trả về toàn bộ stream nếu không có range
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new InputStreamResource(stream));

        } catch (MinioException e) {
            throw new RuntimeException("Lỗi khi lấy video từ MinIO: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi stream video: " + e.getMessage());
        }
    }
}