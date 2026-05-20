package com.SAH.backend.controller;

import com.SAH.backend.dto.*;
import com.SAH.backend.service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/assessments")
@CrossOrigin(origins = "*")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<?> createAssessment(@Valid @RequestBody CreateAssessmentRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }

        Long userId = getCurrentUserId();
        AssessmentDTO assessment = assessmentService.createAssessment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(assessment);
    }

    @GetMapping
    public ResponseEntity<?> getAssessments() {
        Long userId = getCurrentUserId();
        List<AssessmentDTO> assessments = assessmentService.getUserAssessments(userId);
        return ResponseEntity.ok(assessments);
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestAssessment() {
        Long userId = getCurrentUserId();
        AssessmentDTO assessment = assessmentService.getLatestAssessment(userId);
        if (assessment == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(assessment);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getName());
    }
}
