package com.SAH.backend.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssessmentRequest {
    @NotBlank(message = "Responses are required")
    private String responses;
}
