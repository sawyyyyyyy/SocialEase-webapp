package com.SAH.backend.controller;

import com.SAH.backend.dto.*;
import com.SAH.backend.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/progress")
@CrossOrigin(origins = "*")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @GetMapping("/summary")
    public ResponseEntity<?> getProgressSummary() {
        Long userId = getCurrentUserId();
        ProgressSummaryDTO summary = progressService.getProgressSummary(userId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getProgressHistory() {
        Long userId = getCurrentUserId();
        List<ProgressRecordDTO> history = progressService.getProgressHistory(userId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/metrics")
    public ResponseEntity<?> recordMetric(@Valid @RequestBody CreateProgressMetricRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }

        Long userId = getCurrentUserId();
        ProgressRecordDTO record = progressService.recordMetric(userId, request);
        return ResponseEntity.ok(record);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getName());
    }
}
