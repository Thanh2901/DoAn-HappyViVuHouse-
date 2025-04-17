package org.example.backend.service;

import org.example.backend.dto.response.MaintenanceResponse;
import org.example.backend.dto.response.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface MaintenanceService {
    Page<MaintenanceResponse> getAllMaintenance(String keyword, Integer pageNo, Integer pageSize);

    MessageResponse addNewMaintenance(String maintenanceDate, BigDecimal price, Long roomId, List<MultipartFile> files);

    MessageResponse editMaintenance(Long id, String maintenanceDate, BigDecimal price,  Long roomId, List<MultipartFile> files);

    MessageResponse deleteMaintenance(Long id);

    MaintenanceResponse getMaintenance(Long id);

    Page<MaintenanceResponse> filterPriceAsc(String keyword, Integer pageNo, Integer pageSize);

    Page<MaintenanceResponse> filterPriceDesc(String keyword, Integer pageNo, Integer pageSize);

    Page<MaintenanceResponse> filterMaintenanceTimeAsc(String keyword, Integer pageNo, Integer pageSize);
}
