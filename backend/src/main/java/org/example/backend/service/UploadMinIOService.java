package org.example.backend.service;

import java.io.File;

public interface UploadMinIOService {
    String uploadFile(File file, String objectName, String bucketName);
    String uploadVideoToBucket(File file, String objectName, String bucketName) throws Exception;
    String uploadVideoBytes(byte[] videoBytes, String objectName, String bucketName) throws Exception;
}