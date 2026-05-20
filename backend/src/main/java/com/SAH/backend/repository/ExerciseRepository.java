package com.SAH.backend.repository;

import com.SAH.backend.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByType(Exercise.ExerciseType type);
    List<Exercise> findByDifficulty(Exercise.Difficulty difficulty);
    List<Exercise> findByTypeAndDifficulty(Exercise.ExerciseType type, Exercise.Difficulty difficulty);
}
