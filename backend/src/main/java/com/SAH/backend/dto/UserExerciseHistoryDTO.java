package com.SAH.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserExerciseHistoryDTO {
    private Long id;
    private Long exerciseId;
    private String exerciseTitle;
    private String exerciseType;
    private String difficulty;
    private String status;
    private Integer score;
    private Integer durationMinutes;
    private LocalDateTime completionDate;
}
