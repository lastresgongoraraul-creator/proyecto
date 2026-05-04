package com.app.repository;

import com.app.model.ModerationStatus;
import com.app.model.ModerationTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationRepository extends JpaRepository<ModerationTicket, Long> {
    List<ModerationTicket> findByStatus(ModerationStatus status);
}
