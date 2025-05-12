package org.example.backend.repository;

import org.example.backend.model.Camera;
import org.example.backend.model.CameraRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CameraRecordRepository extends JpaRepository<CameraRecord, Long> {
    List<CameraRecord> findByCamera(Camera camera);
}
