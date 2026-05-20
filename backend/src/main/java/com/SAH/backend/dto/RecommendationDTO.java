package com.SAH.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDTO {
    private Long id;
    private Long userId;
    private ExerciseDTO exercise;
    private String reason;
    private Boolean isAccepted;
    private LocalDateTime createdAt;
}
