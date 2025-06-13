package org.example.backend.repository;

import org.example.backend.model.Camera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CameraRepository extends JpaRepository<Camera, Long> {
    List<Camera> findByIsActiveTrue();

    @Query("SELECT c FROM Camera c " +
            "WHERE :userId IS NULL OR c.user.id = :userId ")
    List<Camera> findCameraByUserId(@Param("userId") Long userId);
}
