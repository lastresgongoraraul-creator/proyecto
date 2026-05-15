package com.app.controller;

import com.app.dto.ReviewDto;
import com.app.model.Follow;
import com.app.model.User;
import com.app.repository.FollowRepository;
import com.app.repository.ReviewRepository;
import com.app.repository.ReviewLikeRepository;
import com.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/feed")
@RequiredArgsConstructor
public class FeedController {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;

    @GetMapping
    public ResponseEntity<List<ReviewDto>> getSocialFeed(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> followedUsers = followRepository.findByFollower(currentUser).stream()
                .map(Follow::getFollowed)
                .collect(Collectors.toList());

        if (followedUsers.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<ReviewDto> feed = reviewRepository.findByUserInOrderByCreatedAtDesc(followedUsers).stream()
                .map(r -> ReviewDto.builder()
                        .id(r.getId())
                        .username(r.getUser().getUsername())
                        .score(r.getScore())
                        .comment(r.getComment())
                        .gameId(r.getGame().getId())
                        .gameTitle(r.getGame().getName())
                        .createdAt(r.getCreatedAt())
                        .likesCount(reviewLikeRepository.countByReview(r))
                        .liked(reviewLikeRepository.existsByReviewAndUser(r, currentUser))
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(feed);
    }
}
