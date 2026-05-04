package com.app.repository;

import com.app.model.DirectMessage;
import com.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    @Query("SELECT dm FROM DirectMessage dm WHERE " +
           "(dm.sender = :user1 AND dm.receiver = :user2) OR " +
           "(dm.sender = :user2 AND dm.receiver = :user1) " +
           "ORDER BY dm.createdAt ASC")
    List<DirectMessage> findConversation(@Param("user1") User user1, @Param("user2") User user2);

    List<DirectMessage> findByReceiverOrderByCreatedAtDesc(User receiver);
}
