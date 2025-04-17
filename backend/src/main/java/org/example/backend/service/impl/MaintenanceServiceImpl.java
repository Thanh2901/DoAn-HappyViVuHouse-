package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.MaintenanceResponse;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.Maintenance;
import org.example.backend.model.Room;
import org.example.backend.repository.MaintenanceRepository;
import org.example.backend.repository.RoomRepository;
import org.example.backend.service.BaseService;
import org.example.backend.service.FileStorageService;
import org.example.backend.service.MaintenanceService;
import org.example.backend.utils.MapperUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl extends BaseService implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final MapperUtils mapperUtils;
    private final RoomRepository roomRepository;
    private final FileStorageService fileStorageService;

    @Override
    public Page<MaintenanceResponse> getAllMaintenance(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("room.title").ascending());
        return mapperUtils.convertToResponsePage(maintenanceRepository.searchingMaintenance(keyword, getUserId(), pageable), MaintenanceResponse.class, pageable);
    }

    @Override
    public MessageResponse addNewMaintenance(String maintenanceDate, BigDecimal price, Long roomId, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng đã không tồn tại"));
        Maintenance maintenance = new Maintenance(LocalDateTime.parse(maintenanceDate),price,"http://localhost:8080/document/"+fileStorageService.storeFile(files.get(0)).replace("photographer/files/", ""),getUsername(), getUsername(), room);
        maintenanceRepository.save(maintenance);
        return MessageResponse.builder().message("Thêm phiếu bảo trì thành công").build();
    }

    @Override
    public MessageResponse editMaintenance(Long id, String maintenanceDate, BigDecimal price, Long roomId, List<MultipartFile> files) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new BadRequestException("Phòng đã không tồn tại"));

        Maintenance maintenance = maintenanceRepository.findById(id).orElseThrow(() -> new BadRequestException("Phiếu bảo trì không tồn tại"));
        maintenance.setMaintenanceDate(LocalDateTime.parse(maintenanceDate));
        maintenance.setPrice(price);
        if (Objects.nonNull(files.get(0))) {
            String file = fileStorageService.storeFile(files.get(0)).replace("photographer/files/", "");
            maintenance.setFiles(file);
        }
        maintenance.setRoom(room);
        maintenanceRepository.save(maintenance);
        return MessageResponse.builder().message("Cập nhật thành công").build();
    }

    @Override
    public MessageResponse deleteMaintenance(Long id) {
        maintenanceRepository.deleteById(id);
        return MessageResponse.builder().message("Xóa phiếu bảo trì thành công").build();
    }

    @Override
    public MaintenanceResponse getMaintenance(Long id) {
        return mapperUtils.convertToResponse(maintenanceRepository.findById(id).orElseThrow(() -> new BadRequestException("Không tồn tại")), MaintenanceResponse.class);
    }

    // get room order by price asc
    @Override
    public Page<MaintenanceResponse> filterPriceAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("price").ascending());
        return mapperUtils.convertToResponsePage(maintenanceRepository.searchingMaintenance(keyword, getUserId(), pageable), MaintenanceResponse.class, pageable);
    }

    // get room order by price desc
    @Override
    public Page<MaintenanceResponse> filterPriceDesc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("price").descending());
        return mapperUtils.convertToResponsePage(maintenanceRepository.searchingMaintenance(keyword, getUserId(), pageable), MaintenanceResponse.class, pageable);
    }

    // get room order by price asc
    @Override
    public Page<MaintenanceResponse> filterMaintenanceTimeAsc(String keyword, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("maintenanceDate").ascending());
        return mapperUtils.convertToResponsePage(maintenanceRepository.searchingMaintenance(keyword, getUserId(), pageable), MaintenanceResponse.class, pageable);
    }
}
