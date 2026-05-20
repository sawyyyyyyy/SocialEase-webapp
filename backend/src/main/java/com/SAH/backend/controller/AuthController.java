package com.SAH.backend.controller;

import com.SAH.backend.dto.*;
import com.SAH.backend.exception.ResourceNotFoundException;
import com.SAH.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("error", "Validation failed", result.getFieldErrors().get(0).getDefaultMessage()));
        }

        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("error", "Registration failed", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("error", "Validation failed", result.getFieldErrors().get(0).getDefaultMessage()));
        }

        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("error", "Login failed", "Invalid email or password"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("error", "Login failed", "Invalid email or password"));
        }
    }
}

@lombok.Data
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class ErrorResponse {
    private String status;
    private String message;
    private String error;
}
