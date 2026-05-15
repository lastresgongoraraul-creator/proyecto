package com.app.repository;

import com.app.model.FriendRequest;
import com.app.model.FriendRequestStatus;
import com.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    java.util.List<FriendRequest> findBySenderAndStatusOrReceiverAndStatus(User sender, FriendRequestStatus status1, User receiver, FriendRequestStatus status2);
    boolean existsBySenderAndReceiverAndStatus(User sender, User receiver, FriendRequestStatus status);
    Optional<FriendRequest> findBySenderAndReceiverAndStatus(User sender, User receiver, FriendRequestStatus status);
}
