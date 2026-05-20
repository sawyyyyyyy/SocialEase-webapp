package com.SAH.backend.repository;

import com.SAH.backend.entity.ProgressRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProgressRecordRepository extends JpaRepository<ProgressRecord, Long> {
    List<ProgressRecord> findByUserId(Long userId);
    List<ProgressRecord> findByUserIdOrderByRecordedAtDesc(Long userId);
    List<ProgressRecord> findByUserIdAndRecordedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    @Modifying
    @Query("DELETE FROM ProgressRecord pr WHERE pr.user.id = ?1")
    void deleteAllByUserId(Long userId);
}
