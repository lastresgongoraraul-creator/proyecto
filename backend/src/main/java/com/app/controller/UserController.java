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
}
