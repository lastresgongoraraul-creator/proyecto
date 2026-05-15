package com.app.service;

import com.app.exception.ResourceNotFoundException;
import com.app.model.Follow;
import com.app.model.Review;
import com.app.model.User;
import com.app.repository.FollowRepository;
import com.app.repository.ReviewRepository;
import com.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public void follow(String followerUsername, String followedUsername) {
        if (followerUsername.equals(followedUsername)) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + followerUsername));
        User followed = userRepository.findByUsername(followedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + followedUsername));

        if (followRepository.existsByFollowerAndFollowed(follower, followed)) {
            return; // Already following
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .followed(followed)
                .build();
        followRepository.save(follow);
    }

    @Transactional
    public void unfollow(String followerUsername, String followedUsername) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + followerUsername));
        User followed = userRepository.findByUsername(followedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + followedUsername));

        followRepository.findByFollowerAndFollowed(follower, followed)
                .ifPresent(followRepository::delete);
    }

    public List<Review> getActivityFeed(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        List<User> followedUsers = followRepository.findByFollower(user).stream()
                .map(Follow::getFollowed)
                .collect(Collectors.toList());

        if (followedUsers.isEmpty()) {
            return List.of();
        }

        return reviewRepository.findByUserInOrderByCreatedAtDesc(followedUsers);
    }
}
