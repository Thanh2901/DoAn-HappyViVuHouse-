package org.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "records")
@Data
@NoArgsConstructor
public class CameraRecord extends AbstractEntity<Long>{
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String videoUrl;

    @ManyToOne
    @JoinColumn(name = "camera_id")
    private Camera camera;
}
