package com.SAH.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressSummaryDTO {
    private Integer totalExercises;
    private Integer completedExercises;
    private Double averageScore;
    private Integer currentStreak;
    private String anxietyLevelTrend;
    private int[] dailyScores;
    private Integer totalTimeMinutes;
}
