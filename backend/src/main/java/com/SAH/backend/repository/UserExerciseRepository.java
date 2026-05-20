package com.SAH.backend.repository;

import com.SAH.backend.entity.UserExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserExerciseRepository extends JpaRepository<UserExercise, Long> {
    List<UserExercise> findByUserId(Long userId);
    List<UserExercise> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<UserExercise> findByUserIdAndExerciseId(Long userId, Long exerciseId);
    List<UserExercise> findByUserIdAndStatus(Long userId, UserExercise.Status status);
    long countByUserIdAndStatus(Long userId, UserExercise.Status status);

    @Modifying
    @Query("DELETE FROM UserExercise ue WHERE ue.user.id = ?1")
    void deleteAllByUserId(Long userId);
}
