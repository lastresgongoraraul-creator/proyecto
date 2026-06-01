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
    private final com.app.repository.GameRepository gameRepository;

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
            System.out.println("DEBUG: AI service failed, falling back to top rated games.");
            org.springframework.data.domain.Pageable top10 = org.springframework.data.domain.PageRequest.of(0, 10, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "avgScore"));
            java.util.List<com.app.model.Game> games = gameRepository.findAll(top10).getContent();
            
            java.util.List<java.util.Map<String, Object>> fallback = games.stream().map(g -> java.util.Map.of(
                "id", (Object)g.getId(),
                "name", (Object)g.getName(),
                "summary", g.getSummary() != null ? (Object)g.getSummary() : (Object)"",
                "cover_url", g.getCoverUrl() != null ? (Object)g.getCoverUrl() : (Object)"",
                "primary_genre", g.getPrimaryGenre() != null ? (Object)g.getPrimaryGenre() : (Object)"",
                "platforms", g.getPlatforms() != null ? (Object)g.getPlatforms() : (Object)java.util.List.of(),
                "release_year", g.getReleaseYear() != null ? (Object)g.getReleaseYear() : (Object)0,
                "avg_score", g.getAvgScore() != null ? (Object)g.getAvgScore() : (Object)0
            )).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(fallback);
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
            System.out.println("DEBUG: AI service failed for friends, returning empty list.");
            return ResponseEntity.ok(java.util.List.of());
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

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        java.util.List<User> users = userRepository.findByUsernameContainingIgnoreCase(query);
        return ResponseEntity.ok(users.stream()
                .map(u -> java.util.Map.of(
                        "id", (Object)u.getId(),
                        "username", (Object)u.getUsername(),
                        "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : ""
                ))
                .collect(java.util.stream.Collectors.toList()));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody java.util.Map<String, String> updates, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();
        
        if (updates.containsKey("username")) {
            String newUsername = updates.get("username");
            if (!newUsername.equals(user.getUsername()) && userRepository.findByUsername(newUsername).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            user.setUsername(newUsername);
        }
        
        if (updates.containsKey("avatarUrl")) {
            user.setAvatarUrl(updates.get("avatarUrl"));
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(java.util.Map.of(
                "id", (Object)user.getId(),
                "username", (Object)user.getUsername(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
        ));
    }
}
