package com.app.controller;

import com.app.model.Follow;
import com.app.model.NotificationType;
import com.app.model.User;
import com.app.repository.FollowRepository;
import com.app.repository.ReviewRepository;
import com.app.repository.UserRepository;
import com.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/social")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class SocialController {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final ReviewRepository reviewRepository;
    private final com.app.repository.ReviewLikeRepository reviewLikeRepository;
    private final com.app.repository.FriendRequestRepository friendRequestRepository;
    private final NotificationService notificationService;

    @PostMapping("/follow/{userId}")
    public ResponseEntity<?> follow(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        User follower = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();
        User followed = userRepository.findById(userId).orElseThrow();

        if (follower.getId().equals(followed.getId())) {
            return ResponseEntity.badRequest().body("You cannot follow yourself");
        }

        if (followRepository.existsByFollowerAndFollowed(follower, followed)) {
            return ResponseEntity.badRequest().body("Already following");
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .followed(followed)
                .build();
        followRepository.save(follow);

        notificationService.sendNotification(followed, follower, NotificationType.FOLLOW, follower.getId(), 
                follower.getUsername() + " empezó a seguirte!");

        return ResponseEntity.ok().build();
    }

    @PostMapping("/friend-request/{userId}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println("DEBUG: sendFriendRequest hit for userId: " + userId + " by: " + (userDetails != null ? userDetails.getUsername() : "ANONYMOUS"));
        if (userDetails == null) return ResponseEntity.status(401).build();
        User sender = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();
        User receiver = userRepository.findById(userId).orElseThrow();

        if (sender.getId().equals(receiver.getId())) {
            return ResponseEntity.badRequest().body("You cannot friend yourself");
        }

        if (friendRequestRepository.existsBySenderAndReceiverAndStatus(sender, receiver, com.app.model.FriendRequestStatus.PENDING)) {
            return ResponseEntity.badRequest().body("Request already pending");
        }

        com.app.model.FriendRequest request = com.app.model.FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(com.app.model.FriendRequestStatus.PENDING)
                .build();
        friendRequestRepository.save(request);

        notificationService.sendNotification(receiver, sender, NotificationType.FRIEND_REQUEST, request.getId(), 
                sender.getUsername() + " te envió una solicitud de amistad!");

        return ResponseEntity.ok().build();
    }

    @PostMapping("/friend-request/{requestId}/accept")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long requestId, @AuthenticationPrincipal UserDetails userDetails) {
        com.app.model.FriendRequest request = friendRequestRepository.findById(requestId).orElseThrow();
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();

        if (!request.getReceiver().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        request.setStatus(com.app.model.FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        // Also create reciprocal follows if desired, or just leave as is
        notificationService.sendNotification(request.getSender(), currentUser, NotificationType.FRIEND_ACCEPT, request.getId(), 
                currentUser.getUsername() + " aceptó tu solicitud de amistad!");

        return ResponseEntity.ok().build();
    }

    @PostMapping("/friend-request/{requestId}/reject")
    public ResponseEntity<?> rejectFriendRequest(@PathVariable Long requestId, @AuthenticationPrincipal UserDetails userDetails) {
        com.app.model.FriendRequest request = friendRequestRepository.findById(requestId).orElseThrow();
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();

        if (!request.getReceiver().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        request.setStatus(com.app.model.FriendRequestStatus.REJECTED);
        friendRequestRepository.save(request);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/friend-request/accept-user/{senderId}")
    public ResponseEntity<?> acceptFriendRequestByUserId(@PathVariable Long senderId, @AuthenticationPrincipal UserDetails userDetails) {
        User receiver = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();
        User sender = userRepository.findById(senderId).orElseThrow();

        com.app.model.FriendRequest request = friendRequestRepository.findBySenderAndReceiverAndStatus(sender, receiver, com.app.model.FriendRequestStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("Pending friend request not found"));

        request.setStatus(com.app.model.FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        notificationService.sendNotification(sender, receiver, NotificationType.FRIEND_ACCEPT, request.getId(), 
                receiver.getUsername() + " aceptó tu solicitud de amistad!");

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unfollow/{userId}")
    public ResponseEntity<?> unfollow(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        User follower = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();
        User followed = userRepository.findById(userId).orElseThrow();

        followRepository.findByFollowerAndFollowed(follower, followed)
                .ifPresent(followRepository::delete);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unfriend/{friendId}")
    public ResponseEntity<?> unfriend(@PathVariable Long friendId, @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();
        User friend = userRepository.findById(friendId).orElseThrow();

        List<com.app.model.FriendRequest> requests = friendRequestRepository.findBySenderAndStatusOrReceiverAndStatus(
                currentUser, com.app.model.FriendRequestStatus.ACCEPTED,
                currentUser, com.app.model.FriendRequestStatus.ACCEPTED
        );

        requests.stream()
                .filter(r -> r.getSender().getId().equals(friend.getId()) || r.getReceiver().getId().equals(friend.getId()))
                .forEach(friendRequestRepository::delete);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/friends")
    public ResponseEntity<List<Map<String, Object>>> getFriends(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();
        
        List<com.app.model.FriendRequest> friendRequests = friendRequestRepository.findBySenderAndStatusOrReceiverAndStatus(
                user, com.app.model.FriendRequestStatus.ACCEPTED,
                user, com.app.model.FriendRequestStatus.ACCEPTED
        );
        
        List<Map<String, Object>> friends = friendRequests.stream()
                .map(req -> {
                    User friend = req.getSender().getId().equals(user.getId()) ? req.getReceiver() : req.getSender();
                    return Map.of(
                            "id", (Object)friend.getId(),
                            "username", (Object)friend.getUsername(),
                            "avatarUrl", friend.getAvatarUrl() != null ? friend.getAvatarUrl() : ""
                    );
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User currentUser = userDetails != null ? 
                userRepository.findByUsername(userDetails.getUsername()).or(() -> userRepository.findByEmail(userDetails.getUsername())).orElse(null) : null;

        boolean isFollowing = currentUser != null && followRepository.existsByFollowerAndFollowed(currentUser, user);
        
        String friendStatus = "NONE";
        if (currentUser != null) {
            System.out.println("DEBUG: getProfile calculating friendStatus for currentUser: " + currentUser.getId() + " and target user: " + user.getId());
            if (friendRequestRepository.existsBySenderAndReceiverAndStatus(currentUser, user, com.app.model.FriendRequestStatus.ACCEPTED) ||
                friendRequestRepository.existsBySenderAndReceiverAndStatus(user, currentUser, com.app.model.FriendRequestStatus.ACCEPTED)) {
                friendStatus = "FRIENDS";
            } else if (friendRequestRepository.existsBySenderAndReceiverAndStatus(currentUser, user, com.app.model.FriendRequestStatus.PENDING)) {
                friendStatus = "REQUEST_SENT";
            } else if (friendRequestRepository.existsBySenderAndReceiverAndStatus(user, currentUser, com.app.model.FriendRequestStatus.PENDING)) {
                friendStatus = "REQUEST_RECEIVED";
            }
            System.out.println("DEBUG: Calculated friendStatus: " + friendStatus);
        }

        // This is a simple profile data response
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "createdAt", user.getCreatedAt(),
                "isFollowing", isFollowing,
                "friendStatus", friendStatus,
                "followersCount", followRepository.countByFollowed(user),
                "followingCount", followRepository.countByFollower(user),
                "reviews", reviewRepository.findByUserId(user.getId()).stream()
                        .map(r -> com.app.dto.ReviewDto.builder()
                                .id(r.getId())
                                .username(r.getUser().getUsername())
                                .score(r.getScore())
                                .comment(r.getComment())
                                .createdAt(r.getCreatedAt())
                                .userId(r.getUser().getId())
                                .likesCount(reviewLikeRepository.countByReview(r))
                                .liked(currentUser != null && reviewLikeRepository.existsByReviewAndUser(r, currentUser))
                                .followingAuthor(currentUser != null && followRepository.existsByFollowerAndFollowed(currentUser, r.getUser()))
                                .build())
                        .collect(Collectors.toList())
        ));
    }

    @GetMapping("/activity")
    public ResponseEntity<?> getActivity(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                .orElseThrow();
        List<User> followedUsers = followRepository.findByFollower(user).stream()
                .map(Follow::getFollowed)
                .collect(Collectors.toList());

        if (followedUsers.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(reviewRepository.findByUserInOrderByCreatedAtDesc(followedUsers).stream()
                .map(r -> com.app.dto.ReviewDto.builder()
                        .id(r.getId())
                        .username(r.getUser().getUsername())
                        .score(r.getScore())
                        .comment(r.getComment())
                        .gameId(r.getGame().getId())
                        .gameTitle(r.getGame().getName())
                        .createdAt(r.getCreatedAt())
                        .userId(r.getUser().getId())
                        .likesCount(reviewLikeRepository.countByReview(r))
                        .liked(user != null && reviewLikeRepository.existsByReviewAndUser(r, user))
                        .followingAuthor(user != null && followRepository.existsByFollowerAndFollowed(user, r.getUser()))
                        .build())
                .collect(Collectors.toList()));
    }
}
