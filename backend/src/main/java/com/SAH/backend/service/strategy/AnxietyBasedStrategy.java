package com.SAH.backend.service.strategy;

import com.SAH.backend.entity.*;
import com.SAH.backend.repository.ExerciseRepository;
import com.SAH.backend.repository.UserExerciseRepository;
import java.util.List;
import java.util.stream.Collectors;

public class AnxietyBasedStrategy implements RecommendationStrategy {

    private ExerciseRepository exerciseRepository;
    private UserExerciseRepository userExerciseRepository;

    public AnxietyBasedStrategy(ExerciseRepository exerciseRepository, UserExerciseRepository userExerciseRepository) {
        this.exerciseRepository = exerciseRepository;
        this.userExerciseRepository = userExerciseRepository;
    }

    @Override
    public List<RecommendedExercise> recommendExercises(User user, List<Assessment> assessments) {
        String reason;
        Exercise.Difficulty recommendedDifficulty;

        if (assessments.isEmpty()) {
            recommendedDifficulty = Exercise.Difficulty.BEGINNER;
            reason = "Start with BEGINNER exercises to build confidence at your own pace.";
        } else {
            Assessment latest = assessments.get(0);
            recommendedDifficulty = getDifficultyByAnxiety(latest.getAnxietyLevel());
            reason = switch (latest.getAnxietyLevel()) {
                case LOW -> "Your anxiety is LOW — you're ready for INTERMEDIATE exercises to keep growing.";
                case MODERATE -> "Your anxiety is MODERATE — BEGINNER exercises will help you build a steady foundation.";
                case HIGH -> "Your anxiety is HIGH — try BEGINNER exercises in a safe, low-pressure setting.";
                case SEVERE -> "Your anxiety is HIGH — start with gentle BEGINNER exercises. Small steps lead to big progress.";
            };
        }

        List<Long> completedIds = userExerciseRepository.findByUserId(user.getId())
                .stream()
                .map(ue -> ue.getExercise().getId())
                .collect(Collectors.toList());

        return exerciseRepository.findByDifficulty(recommendedDifficulty)
                .stream()
                .filter(e -> !completedIds.contains(e.getId()))
                .limit(3)
                .map(e -> new RecommendedExercise(e, reason))
                .collect(Collectors.toList());
    }

    private Exercise.Difficulty getDifficultyByAnxiety(Assessment.AnxietyLevel level) {
        return switch (level) {
            case LOW -> Exercise.Difficulty.INTERMEDIATE;
            case MODERATE -> Exercise.Difficulty.BEGINNER;
            case HIGH, SEVERE -> Exercise.Difficulty.BEGINNER;
        };
    }
}
