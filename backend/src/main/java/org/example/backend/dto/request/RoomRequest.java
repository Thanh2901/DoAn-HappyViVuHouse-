package org.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.RoomStatus;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
    private String title;

    private String description;

    private BigDecimal price;

    private Double latitude;

    private Double longitude;

    private String address;

    private Long locationId;

    private Long categoryId;

    private RoomStatus status;

    private List<AssetRequest> assets;

    private List<MultipartFile> files;

    private BigDecimal waterCost = BigDecimal.ZERO;
    private BigDecimal publicElectricCost = BigDecimal.ZERO;
    private BigDecimal internetCost = BigDecimal.ZERO;
}
