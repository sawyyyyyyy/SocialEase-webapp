package com.SAH.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentDTO {
    private Long id;
    private Long userId;
    private String anxietyLevel;
    private Integer score;
    private String responses;
    private LocalDateTime createdAt;
}
