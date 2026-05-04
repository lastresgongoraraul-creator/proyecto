package com.app.repository;

import com.app.model.CommunityMember;
import com.app.model.Game;
import com.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {
    boolean existsByUserAndGame(User user, Game game);
    Optional<CommunityMember> findByUserAndGame(User user, Game game);
    List<CommunityMember> findByUser(User user);
    long countByGame(Game game);
}
