package com.SAH.backend.repository;

import com.SAH.backend.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Recommendation> findByUserIdAndIsAccepted(Long userId, Boolean isAccepted);

    @Modifying
    @Query("DELETE FROM Recommendation r WHERE r.user.id = ?1")
    void deleteAllByUserId(Long userId);
}
