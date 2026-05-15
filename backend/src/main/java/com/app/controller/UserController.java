package com.app.controller;

import com.app.model.Follow;
import com.app.model.NotificationType;
import com.app.model.User;
import com.app.repository.FollowRepository;
import com.app.repository.UserRepository;
import com.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final NotificationService notificationService;

    @PostMapping("/{id}/follow")
    public ResponseEntity<?> followUser(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User follower = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        User followed = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));

        if (follower.getId().equals(followed.getId())) {
            return ResponseEntity.badRequest().body("You cannot follow yourself");
        }

        if (followRepository.existsByFollowerAndFollowed(follower, followed)) {
            return ResponseEntity.badRequest().body("Already following this user");
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .followed(followed)
                .build();
        followRepository.save(follow);

        notificationService.sendNotification(followed, follower, NotificationType.FOLLOW, follower.getId(), 
                follower.getUsername() + " started following you!");

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User follower = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        User followed = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        followRepository.findByFollowerAndFollowed(follower, followed)
                .ifPresent(followRepository::delete);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/recommended-games")
    public ResponseEntity<?> getRecommendedGames(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("DEBUG: getRecommendedGames called for user: " + user.getUsername() + " with ID: " + user.getId());
        
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        String url = "http://ai-service:8000/recommendations/user/" + user.getId();
        try {
            ResponseEntity<java.util.List> response = restTemplate.getForEntity(url, java.util.List.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error calling AI service: " + e.getMessage());
        }
    }

    @GetMapping("/me/recommended-friends")
    public ResponseEntity<?> getRecommendedFriends(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("DEBUG: getRecommendedFriends called for user: " + user.getUsername() + " with ID: " + user.getId());
        
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        String url = "http://ai-service:8000/social/recommendations/" + user.getId();
        try {
            ResponseEntity<java.util.List> response = restTemplate.getForEntity(url, java.util.List.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error calling AI service: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/ban")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<?> banUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setStatus("BANNED");
        userRepository.save(user);
        
        return ResponseEntity.ok().build();
    }
}
