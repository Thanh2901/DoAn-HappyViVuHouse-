package org.example.backend.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.MediaSource;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
@RequiredArgsConstructor
public class StreamingClient {
    private final RestClient restClient;
    @Value("${media.server.base-path}")
    private String basePath;

    public String publishingSource(MediaSource mediaSource) {
        String response = restClient
                .post()
                .uri(basePath + "/config/paths/add/" + mediaSource.getName())
                .header("Content-Type", "application/json")
                .body(mediaSource)
                .retrieve()
                .onStatus(status->status.equals(HttpStatus.BAD_REQUEST), (req, res) -> {
                    ObjectMapper mapper = new ObjectMapper();
                    res.getBody();
                    String responseBody = mapper.writeValueAsString(res.getBody());
                    JsonNode errorNode = mapper.readTree(responseBody);
                    String errorMessage = errorNode.get("errorMessage").asText("");
                    if ("path already exists".equals(errorMessage)) {
                        throw new RuntimeException("Path already exists");
                    } else {
                        throw new RuntimeException("Bad request: " + errorMessage);
                    }
                })
                .body(String.class);
        log.info("Publishing source: {}", mediaSource.getName());
        return response;
    }

    public boolean checkCameraStatus(String cameraName) {
        try {
            String response = restClient
                    .get()
                    .uri(basePath + "/paths/get/" + cameraName.replaceAll(" ", "").toLowerCase())
                    .retrieve()
                    .onStatus(status -> status.value() == 404, (req, res) -> {
                        throw new RuntimeException("Not found: " + cameraName);
                    })
                    .body(String.class);

            JSONObject jsonObject = new JSONObject(response);
            boolean ready = jsonObject.getBoolean("ready");
            log.info("Camera {} status: ready = {}", cameraName, ready);
            return ready;
        } catch (Exception e) {
            log.warn("Failed to check status for camera {}: {}", cameraName, e.getMessage());
            return false;
        }
    }

    public String getPath(String cameraName) {
        return restClient
                .get()
                .uri(basePath + "/config/paths/get/" + cameraName)
                .retrieve()
                .onStatus(status -> status.value() == 404, (req, res) -> {
                    throw new RuntimeException("Not found: " + cameraName);
                })
                .body(String.class);
    }

    public void deletePath(String cameraName) {
        restClient.delete()
                .uri(basePath + "/config/paths/delete/" + cameraName)
                .retrieve()
                .body(String.class);
    }
}
