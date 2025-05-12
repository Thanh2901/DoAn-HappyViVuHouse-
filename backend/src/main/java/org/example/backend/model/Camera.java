package org.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "camera")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Camera extends AbstractEntity<Long>{
    private String name;
    private String ip;
    private int port;
    private boolean isActive = true; // Mặc định là true để ghi hình

    // Tạo URL camera từ ip và port
    public String getHttpUrl() {
        return "http://" + ip + ":" + port + "/video";
    }

    public String getRTSPUrl() {
        return "rtsp://" + ip + ":" + port + "/h264_ulaw.sdp";
    }
}
