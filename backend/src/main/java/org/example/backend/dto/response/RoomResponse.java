package org.example.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RoomResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Double latitude;
    private Double longitude;
    private String address;
    private String status;
    private String roomType;
    private String isLocked;
    private String isApprove;
    private Boolean isRemove;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocationResponse location;
    private CategoryResponse category;
    private List<AssetResponse> assets;
    private List<RoomMediaResponse> roomMedia;
    private UserResponse user;
    private BigDecimal waterCost;
    private BigDecimal publicElectricCost;
    private BigDecimal internetCost;
}
