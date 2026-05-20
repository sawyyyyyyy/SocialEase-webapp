package com.SAH.backend.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Min(value = 13, message = "Age must be at least 13")
    @Max(value = 120, message = "Age must be valid")
    private Integer age;

    private String username;
}
