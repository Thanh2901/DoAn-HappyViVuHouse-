package org.example.backend.service.impl;

import lombok.NoArgsConstructor;
import org.example.backend.config.FileStorageProperties;
import org.example.backend.exception.FileStorageException;
import org.example.backend.exception.MyFileNotFoundException;
import org.example.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;

@Service
@NoArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private Path fileStorageLocation;

    @Autowired
    public FileStorageServiceImpl(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
        .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException e) {
            throw new FileStorageException(e.getMessage());
        }
    }

    public String storeFile(MultipartFile file) {
        // normalize name file
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        try {
            // check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                throw new FileStorageException("Invalid!!!");
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            String filePath = this.fileStorageLocation + "\\" + fileName;
            ((MultipartFile) file).transferTo(new File(filePath));

            return fileName;
        } catch (IOException e) {
            throw new FileStorageException("Invalid!!!");
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new MyFileNotFoundException("File not found: " + fileName);
            }
        } catch (MalformedURLException e) {
            throw new MyFileNotFoundException("File not found: " + fileName);
        }
    }
}
