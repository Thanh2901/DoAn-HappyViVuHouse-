package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<?> getAllMaintenance(@RequestParam String keyword,
                                               @RequestParam Integer pageNo,
                                               @RequestParam Integer pageSize){
        return ResponseEntity.ok(maintenanceService.getAllMaintenance(keyword, pageNo, pageSize));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMaintenanceById(@PathVariable Long id){
        return ResponseEntity.ok(maintenanceService.getMaintenance(id));
    }

    @PostMapping
    public ResponseEntity<?> addNewMaintenance(@RequestParam String maintenanceDate,
                                               @RequestParam BigDecimal price,
                                               @RequestParam Long roomId,
                                               @RequestParam List<MultipartFile> files){
        return ResponseEntity.ok(maintenanceService.addNewMaintenance(maintenanceDate, price, roomId, files));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editMaintenance(@PathVariable Long id, @RequestParam String maintenanceDate,
                                             @RequestParam BigDecimal price,
                                             @RequestParam Long roomId,
                                             @RequestParam List<MultipartFile> files){
        return ResponseEntity.ok(maintenanceService.editMaintenance(id, maintenanceDate, price, roomId, files));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaintenance(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.deleteMaintenance(id));
    }

    // get rooms order by price asc
    @GetMapping("/filter/price-asc")
    public ResponseEntity<?> filterPriceAsc(@RequestParam String keyword,
                                            @RequestParam Integer pageNo,
                                            @RequestParam Integer pageSize){
        return ResponseEntity.ok(maintenanceService.filterPriceAsc(keyword, pageNo, pageSize));
    }

    // get rooms order by price desc
    @GetMapping("/filter/price-desc")
    public ResponseEntity<?> filterPriceDesc(@RequestParam String keyword,
                                            @RequestParam Integer pageNo,
                                            @RequestParam Integer pageSize){
        return ResponseEntity.ok(maintenanceService.filterPriceDesc(keyword, pageNo, pageSize));
    }

    // get rooms order by maintenance asc
    @GetMapping("/filter/time-asc")
    public ResponseEntity<?> filterMaintenanceTimeAsc(@RequestParam String keyword,
                                             @RequestParam Integer pageNo,
                                             @RequestParam Integer pageSize){
        return ResponseEntity.ok(maintenanceService.filterMaintenanceTimeAsc(keyword, pageNo, pageSize));
    }

}
