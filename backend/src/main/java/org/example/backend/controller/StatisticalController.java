package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.service.StatisticalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/statistical")
@RequiredArgsConstructor
public class StatisticalController {

    private final StatisticalService statisticalService;

    @GetMapping
    public ResponseEntity<?> getNumber(){
        return ResponseEntity.ok(statisticalService.getNumberOfRentalerForStatistical());
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getStatisticalOfAdmin() {
        return ResponseEntity.ok(statisticalService.getStatisticalNumberOfAdmin());
    }

    @GetMapping("/get-by-month")
    public ResponseEntity<?> getByMonth() {
        return ResponseEntity.ok(statisticalService.getByMonth());
    }

    @GetMapping("/cost")
    public ResponseEntity<?> getByCost() {
        return ResponseEntity.ok(statisticalService.getByCost());
    }
}

