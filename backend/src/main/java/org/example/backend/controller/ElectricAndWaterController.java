package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.ElectricAndWaterResponse;
import org.example.backend.model.ElectricAndWater;
import org.example.backend.security.TokenProvider;
import org.example.backend.service.ElectricAndWaterService;
import org.example.backend.service.RoomService;
import org.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

@RestController
@RequestMapping("/electric-water")
@RequiredArgsConstructor
public class ElectricAndWaterController {

    private final ElectricAndWaterService electricAndWaterService;

    @GetMapping
    public ResponseEntity<?> getElectric(@RequestParam String keyword,
                                        @RequestParam Integer pageNo,
                                         @RequestParam Integer pageSize) {
        if (keyword != null) {
            keyword = URLDecoder.decode(keyword, StandardCharsets.UTF_8);
        }
        return ResponseEntity.ok(electricAndWaterService.getAllElectricAndWater(keyword, pageNo, pageSize));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createElectricAndWater(@RequestBody ElectricAndWater electricAndWater) {
        ElectricAndWater newElectricAndWater = electricAndWaterService.saveElectric(electricAndWater);
        return ResponseEntity.ok(newElectricAndWater);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateElectricAndWater(@RequestBody ElectricAndWater electricAndWater, @PathVariable Long id) {
        ElectricAndWater updatedElectricAndWater = electricAndWaterService.updateElectric(electricAndWater, id);
        return ResponseEntity.ok(updatedElectricAndWater);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getElectricAndWater(@PathVariable Long id) {
        ElectricAndWaterResponse electric = electricAndWaterService.getElectricAndWater(id);
        return ResponseEntity.ok(electric);
    }

    @GetMapping("/filter/")
    public ResponseEntity<?> getElectricAndWaterByFilter(@RequestParam String field,
                                                         @RequestParam String order,
                                                         @RequestParam String keyword,
                                                         @RequestParam Integer pageNo,
                                                         @RequestParam Integer pageSize) {
        return ResponseEntity.ok(electricAndWaterService.getElectricAndWaterByFilter(field, order, keyword, pageNo, pageSize));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteElectricAndWater(@RequestParam("id") Long id) {
        electricAndWaterService.deleteElectricAndWater(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Invoice is deleted"));
    }
}

