package com.SAH.backend.controller;

import com.SAH.backend.dto.SupportRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/support")
@CrossOrigin(origins = "*")
public class SupportController {

    @PostMapping
    public ResponseEntity<?> submitSupport(@Valid @RequestBody SupportRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Subject and description are required"));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Support request received",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
