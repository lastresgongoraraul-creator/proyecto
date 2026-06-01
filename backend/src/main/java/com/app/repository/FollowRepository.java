package com.app.repository;

import com.app.model.Follow;
import com.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerAndFollowed(User follower, User followed);
    boolean existsByFollowerAndFollowed(User follower, User followed);
    List<Follow> findByFollower(User follower);
    List<Follow> findByFollowed(User followed);
    long countByFollowed(User followed);
    long countByFollower(User follower);
}
