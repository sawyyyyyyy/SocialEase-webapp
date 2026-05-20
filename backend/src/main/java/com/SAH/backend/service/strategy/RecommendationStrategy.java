package com.SAH.backend.service.strategy;

import com.SAH.backend.entity.Assessment;
import com.SAH.backend.entity.User;
import java.util.List;

public interface RecommendationStrategy {
    List<RecommendedExercise> recommendExercises(User user, List<Assessment> assessments);
}
