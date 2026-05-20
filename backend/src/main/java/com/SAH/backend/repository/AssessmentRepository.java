package com.SAH.backend.repository;

import com.SAH.backend.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT a FROM Assessment a WHERE a.user.id = ?1 ORDER BY a.createdAt DESC LIMIT 1")
    Optional<Assessment> findLatestByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM Assessment a WHERE a.user.id = ?1")
    void deleteAllByUserId(Long userId);
}
