package com.SAH.backend.controller;

import com.SAH.backend.dto.*;
import com.SAH.backend.service.ExerciseService;
import com.SAH.backend.entity.UserExercise;
import com.SAH.backend.entity.User;
import com.SAH.backend.repository.UserRepository;
import com.SAH.backend.repository.UserExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/exercises")
@CrossOrigin(origins = "*")
public class ExerciseController {

    @Autowired
    private ExerciseService exerciseService;

    @Autowired
    private UserExerciseRepository userExerciseRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getExercises(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String difficulty) {
        List<ExerciseDTO> exercises = exerciseService.getAllExercises(type, difficulty);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getUserExerciseHistory() {
        Long userId = getCurrentUserId();
        List<UserExerciseHistoryDTO> history = userExerciseRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ue -> UserExerciseHistoryDTO.builder()
                        .id(ue.getId())
                        .exerciseId(ue.getExercise().getId())
                        .exerciseTitle(ue.getExercise().getTitle())
                        .exerciseType(ue.getExercise().getType().toString())
                        .difficulty(ue.getExercise().getDifficulty().toString())
                        .status(ue.getStatus().toString())
                        .score(ue.getScore())
                        .durationMinutes(ue.getExercise().getDurationMinutes())
                        .completionDate(ue.getCompletionDate())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExerciseById(@PathVariable Long id) {
        ExerciseDTO exercise = exerciseService.getExerciseById(id);
        return ResponseEntity.ok(exercise);
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startExercise(@PathVariable Long id) {
        Long userId = getCurrentUserId();

        var existing = userExerciseRepository.findByUserIdAndExerciseId(userId, id);
        if (existing.isPresent() && existing.get().getStatus() != UserExercise.Status.NOT_STARTED) {
            return ResponseEntity.badRequest().body("Exercise already started");
        }

        var exercise = exerciseService.getExerciseEntity(id);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.SAH.backend.exception.ResourceNotFoundException("User not found"));
        
        UserExercise userExercise;
        if (existing.isPresent()) {
            userExercise = existing.get();
        } else {
            userExercise = UserExercise.builder()
                    .user(user)
                    .exercise(exercise)
                    .status(UserExercise.Status.IN_PROGRESS)
                    .build();
        }
        
        userExercise.setStatus(UserExercise.Status.IN_PROGRESS);
        userExercise = userExerciseRepository.save(userExercise);

        return ResponseEntity.ok(new StartExerciseResponse(
                "Exercise started",
                userExercise.getId(),
                LocalDateTime.now()
        ));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeExercise(
            @PathVariable Long id,
            @Valid @RequestBody CompleteExerciseRequest request,
            BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }

        Long userId = getCurrentUserId();

        var userExercise = userExerciseRepository.findByUserIdAndExerciseId(userId, id)
                .orElseThrow(() -> new com.SAH.backend.exception.ResourceNotFoundException("Exercise not found"));

        userExercise.setStatus(UserExercise.Status.COMPLETED);
        userExercise.setScore(request.getScore());
        userExercise.setNotes(request.getNotes());
        userExercise.setCompletionDate(LocalDateTime.now());

        userExercise = userExerciseRepository.save(userExercise);

        return ResponseEntity.ok(new CompleteExerciseResponse(
                "Exercise completed successfully",
                userExercise.getId(),
                userExercise.getScore(),
                userExercise.getCompletionDate()
        ));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getName());
    }
}

@lombok.Data
@lombok.AllArgsConstructor
class StartExerciseResponse {
    private String message;
    private Long userExerciseId;
    private LocalDateTime startedAt;
}

@lombok.Data
@lombok.AllArgsConstructor
class CompleteExerciseResponse {
    private String message;
    private Long userExerciseId;
    private Integer score;
    private LocalDateTime completedAt;
}
