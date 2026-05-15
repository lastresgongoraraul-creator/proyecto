package com.app.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public boolean checkModeration(String text) {
        try {
            String url = aiServiceUrl + "/social/moderation/check";
            Map<String, String> request = new HashMap<>();
            request.put("text", text);

            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            if (response != null && response.containsKey("is_offensive")) {
                return (Boolean) response.get("is_offensive");
            }
        } catch (Exception e) {
            log.error("Error calling AI moderation service: {}", e.getMessage());
        }
        return false;
    }

    public void generateReviewEmbedding(Long reviewId) {
        try {
            String url = aiServiceUrl + "/social/reviews/" + reviewId + "/embedding";
            restTemplate.postForObject(url, null, Map.class);
        } catch (Exception e) {
            log.error("Error generating review embedding for ID {}: {}", reviewId, e.getMessage());
        }
    }

    public void updateUserEmbedding(Long userId) {
        try {
            String url = aiServiceUrl + "/social/users/" + userId + "/update-embedding";
            restTemplate.postForObject(url, null, Map.class);
        } catch (Exception e) {
            log.error("Error updating user embedding for ID {}: {}", userId, e.getMessage());
        }
    }
}
