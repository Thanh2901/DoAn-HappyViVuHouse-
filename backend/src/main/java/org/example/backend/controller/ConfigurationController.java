package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.model.Configuration;
import org.example.backend.repository.ConfigurationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/configuration")
@RequiredArgsConstructor
public class ConfigurationController {

    private final ConfigurationRepository configurationRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllConfigurations(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {

        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Configuration> page = configurationRepository.findAll(pageable);

        // Return data in expected format for frontend
        Map<String, Object> response = new HashMap<>();
        response.put("content", page.getContent());
        response.put("totalElements", page.getTotalElements());
        response.put("totalPages", page.getTotalPages());
        response.put("number", page.getNumber());
        response.put("size", page.getSize());

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<String> updateConfigurations(@RequestBody List<Configuration> configurations) {
        try {
            configurationRepository.saveAll(configurations);
            return ResponseEntity.ok("Configurations updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update configurations: " + e.getMessage());
        }
    }

    @GetMapping("/{key}")
    public ResponseEntity<Configuration> getConfigurationByKey(@PathVariable String key) {
        return configurationRepository.findById(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Configuration> saveConfiguration(@RequestBody Configuration configuration) {
        try {
            Configuration savedConfig = configurationRepository.save(configuration);
            return ResponseEntity.ok(savedConfig);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable String key) {
        try {
            configurationRepository.deleteById(key);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}