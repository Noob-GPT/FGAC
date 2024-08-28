package com.npt.fgac.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.npt.fgac.config.ChatGPTConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RequiredArgsConstructor
@Service
public class ImgurServiceImpl implements ImgurService {
    private final ChatGPTConfig chatGPTConfig;
    @Value("${my.api.image}")
    private String clientId;

    public String uploadImage(MultipartFile file) {
        String imgurUrl = null;
        try {
            // Imgur API endpoint
            String url = "https://api.imgur.com/3/image";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Client-ID " + clientId);
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Set up MultiValueMap to hold the file
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename(); // Set filename
                }
            });

            // Set up multipart file request entity
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Send POST request to Imgur API
            RestTemplate restTemplate = chatGPTConfig.restTemplate();
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            // Check for response status code
            if (response.getStatusCode() == HttpStatus.OK) {
                // Parse JSON response to extract image URL
                ObjectMapper om = new ObjectMapper();
                JsonNode jsonResponse = om.readTree(response.getBody());
                JsonNode dataNode = jsonResponse.path("data");
                imgurUrl = dataNode.path("link").asText();
            } else {
                // Handle non-OK response status
                throw new RuntimeException("Failed to upload image: " + response.getStatusCode());
            }
        } catch (Exception e) {
            // Handle exceptions
            e.printStackTrace();
            throw new RuntimeException("Error occurred while uploading image", e);
        }
        return imgurUrl;
    }
}
