package com.SAH.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String status;
    private String token;
    private UserDTO user;
    private String message;
}
