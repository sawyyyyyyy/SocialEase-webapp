package com.SAH.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseDTO {
    private Long id;
    private String title;
    private String description;
    private String type;
    private String difficulty;
    private Integer durationMinutes;
    private LocalDateTime createdAt;
}
