package org.example.backend.config;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(
        prefix = "file",
        ignoreUnknownFields = true,
        ignoreInvalidFields = true
)
@NoArgsConstructor
@Data
public class FileStorageProperties {
    private String uploadDir;
    private String tempExportExcel;
    private String libreOfficePath;
}
