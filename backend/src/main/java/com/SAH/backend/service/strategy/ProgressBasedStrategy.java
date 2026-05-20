package com.SAH.backend.service.strategy;

import com.SAH.backend.entity.*;
import com.SAH.backend.repository.ExerciseRepository;
import com.SAH.backend.repository.UserExerciseRepository;
import java.util.List;
import java.util.stream.Collectors;

public class ProgressBasedStrategy implements RecommendationStrategy {

    private ExerciseRepository exerciseRepository;
    private UserExerciseRepository userExerciseRepository;

    public ProgressBasedStrategy(ExerciseRepository exerciseRepository, UserExerciseRepository userExerciseRepository) {
        this.exerciseRepository = exerciseRepository;
        this.userExerciseRepository = userExerciseRepository;
    }

    @Override
    public List<RecommendedExercise> recommendExercises(User user, List<Assessment> assessments) {
        List<UserExercise> completed = userExerciseRepository.findByUserIdAndStatus(user.getId(), UserExercise.Status.COMPLETED);
        int completedCount = completed.size();

        double averageScore = completed.stream()
                .filter(e -> e.getScore() != null)
                .mapToInt(UserExercise::getScore)
                .average()
                .orElse(0.0);

        Exercise.Difficulty nextDifficulty = getNextDifficulty(averageScore, completedCount);
        String reason = getReason(nextDifficulty, completedCount, (int) Math.round(averageScore));

        List<Long> completedIds = completed.stream()
                .map(ue -> ue.getExercise().getId())
                .collect(Collectors.toList());

        return exerciseRepository.findByDifficulty(nextDifficulty)
                .stream()
                .filter(e -> !completedIds.contains(e.getId()))
                .limit(3)
                .map(e -> new RecommendedExercise(e, reason))
                .collect(Collectors.toList());
    }

    private Exercise.Difficulty getNextDifficulty(double averageScore, int completedCount) {
        if (completedCount < 3) {
            return Exercise.Difficulty.BEGINNER;
        }
        if (averageScore >= 75) {
            return Exercise.Difficulty.ADVANCED;
        }
        if (averageScore >= 60) {
            return Exercise.Difficulty.INTERMEDIATE;
        }
        return Exercise.Difficulty.BEGINNER;
    }

    private String getReason(Exercise.Difficulty difficulty, int count, int avg) {
        if (count == 0) {
            return "You haven't completed any exercises yet — start with BEGINNER level to get going.";
        }
        if (count < 3) {
            return "You've completed " + count + " exercise" + (count == 1 ? "" : "s") + " — keep building momentum with BEGINNER exercises.";
        }
        return switch (difficulty) {
            case ADVANCED -> "Great work! You're averaging " + avg + "% across " + count + " exercises. Time for ADVANCED challenges.";
            case INTERMEDIATE -> "Solid progress! You're averaging " + avg + "% across " + count + " exercises. Try INTERMEDIATE level next.";
            case BEGINNER -> "You've completed " + count + " exercises (avg " + avg + "%) — keep practicing at BEGINNER level to strengthen your foundation.";
        };
    }
}
