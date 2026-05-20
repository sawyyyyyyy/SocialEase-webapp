package com.SAH.backend.controller;

import com.SAH.backend.dto.RecommendationDTO;
import com.SAH.backend.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<?> getRecommendations() {
        Long userId = getCurrentUserId();
        List<RecommendationDTO> recommendations = recommendationService.getRecommendations(userId);
        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRecommendation(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        recommendationService.acceptRecommendation(userId, id);
        return ResponseEntity.ok(new MessageResponse("Recommendation accepted"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> dismissRecommendation(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        recommendationService.dismissRecommendation(userId, id);
        return ResponseEntity.ok(new MessageResponse("Recommendation dismissed"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getName());
    }
}

@lombok.Data
@lombok.AllArgsConstructor
class MessageResponse {
    private String message;
}
