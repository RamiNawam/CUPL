package com.cupl.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

@Service
public class ImageService {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Save base64 image to filesystem and return the URL
     */
    public String saveBase64Image(String base64Image, String folder) throws IOException {
        if (base64Image == null || base64Image.isEmpty()) {
            return null;
        }

        // Extract base64 data (remove data:image/png;base64, prefix if present)
        String base64Data = base64Image;
        String imageFormat = "png";
        
        if (base64Image.contains(",")) {
            String[] parts = base64Image.split(",");
            base64Data = parts[1];
            String mimeType = parts[0];
            if (mimeType.contains("jpeg") || mimeType.contains("jpg")) {
                imageFormat = "jpg";
            } else if (mimeType.contains("png")) {
                imageFormat = "png";
            } else if (mimeType.contains("gif")) {
                imageFormat = "gif";
            } else if (mimeType.contains("webp")) {
                imageFormat = "webp";
            }
        }

        // Decode base64
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, folder);
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String filename = UUID.randomUUID().toString() + "." + imageFormat;
        Path filePath = uploadPath.resolve(filename);

        // Save file
        Files.write(filePath, imageBytes);

        // Return URL path (relative to base URL)
        return "/" + uploadDir + "/" + folder + "/" + filename;
    }

    /**
     * Delete image file
     */
    public void deleteImage(String imagePath) throws IOException {
        if (imagePath == null || imagePath.isEmpty()) {
            return;
        }

        // Remove leading slash if present
        String cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
        Path filePath = Paths.get(cleanPath);

        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }

    /**
     * Get full URL for an image path
     */
    public String getImageUrl(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return null;
        }

        // If already a full URL, return as is
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }

        // Return relative path (frontend will handle it)
        return imagePath;
    }
}
