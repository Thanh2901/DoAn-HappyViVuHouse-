package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GeocodingController {

    private final RestClient restClient;

    @GetMapping("/geocode")
    public ResponseEntity<?> geocode(@RequestParam String query) {
        try {
            // Add proper error handling and timeout
            String response = restClient.get()
                    .uri("https://nominatim.openstreetmap.org/search?format=json&countrycodes=vn&q={query}", query)
                    .header("User-Agent", "YourApplication/1.0")
                    .retrieve()
                    .body(String.class);

            // Check if response is valid (simple validation)
            if (response == null || response.trim().isEmpty() ||
                    (!response.trim().startsWith("[") && !response.trim().startsWith("{"))) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("{\"error\": \"Invalid response from geocoding service\"}");
            }

            return ResponseEntity.ok(response);
        } catch (RestClientException e) {
            // Log the exception for server-side debugging
            e.printStackTrace();

            // Return a proper JSON error response that the client can handle
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Error connecting to geocoding service: " + e.getMessage() + "\"}");
        } catch (Exception e) {
            // Catch any other unexpected exceptions
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Unexpected error: " + e.getMessage() + "\"}");
        }
    }
}