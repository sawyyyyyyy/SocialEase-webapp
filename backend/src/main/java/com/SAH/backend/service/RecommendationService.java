package com.SAH.backend.service;

import com.SAH.backend.dto.ExerciseDTO;
import com.SAH.backend.dto.RecommendationDTO;
import com.SAH.backend.entity.*;
import com.SAH.backend.repository.*;
import com.SAH.backend.exception.ResourceNotFoundException;
import com.SAH.backend.service.strategy.RecommendationStrategy;
import com.SAH.backend.service.strategy.AnxietyBasedStrategy;
import com.SAH.backend.service.strategy.ProgressBasedStrategy;
import com.SAH.backend.service.strategy.RecommendedExercise;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private UserExerciseRepository userExerciseRepository;

    public List<RecommendationDTO> getRecommendations(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Recommendation> existing = recommendationRepository.findByUserIdAndIsAccepted(userId, false);
        if (existing.isEmpty()) {
            generateRecommendations(userId);
        }

        return recommendationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(r -> !r.getIsAccepted())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void generateRecommendations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Assessment> assessments = assessmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        RecommendationStrategy anxietyStrategy = new AnxietyBasedStrategy(exerciseRepository, userExerciseRepository);
        RecommendationStrategy progressStrategy = new ProgressBasedStrategy(exerciseRepository, userExerciseRepository);

        List<RecommendedExercise> anxietyBased = anxietyStrategy.recommendExercises(user, assessments);
        List<RecommendedExercise> progressBased = progressStrategy.recommendExercises(user, assessments);

        Map<Exercise, String> merged = new LinkedHashMap<>();
        for (RecommendedExercise re : anxietyBased) merged.put(re.getExercise(), re.getReason());
        for (RecommendedExercise re : progressBased) {
            merged.merge(re.getExercise(), re.getReason(), (a, b) -> a + " Also, " + b.substring(0, 1).toLowerCase() + b.substring(1));
        }

        for (Map.Entry<Exercise, String> entry : merged.entrySet()) {
            if (!userExerciseRepository.findByUserIdAndExerciseId(userId, entry.getKey().getId()).isPresent()) {
                Recommendation rec = Recommendation.builder()
                        .user(user)
                        .exercise(entry.getKey())
                        .reason(entry.getValue())
                        .isAccepted(false)
                        .build();
                recommendationRepository.save(rec);
            }
        }
    }

    public void acceptRecommendation(Long userId, Long recommendationId) {
        Recommendation rec = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found"));

        if (!rec.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        rec.setIsAccepted(true);
        recommendationRepository.save(rec);

        UserExercise userExercise = userExerciseRepository.findByUserIdAndExerciseId(userId, rec.getExercise().getId())
                .orElse(null);

        if (userExercise == null) {
            userExercise = UserExercise.builder()
                    .user(rec.getUser())
                    .exercise(rec.getExercise())
                    .status(UserExercise.Status.NOT_STARTED)
                    .build();
            userExerciseRepository.save(userExercise);
        }
    }

    public void dismissRecommendation(Long userId, Long recommendationId) {
        Recommendation rec = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found"));

        if (!rec.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        recommendationRepository.delete(rec);
    }

    private RecommendationDTO convertToDTO(Recommendation rec) {
        return RecommendationDTO.builder()
                .id(rec.getId())
                .userId(rec.getUser().getId())
                .exercise(ExerciseDTO.builder()
                        .id(rec.getExercise().getId())
                        .title(rec.getExercise().getTitle())
                        .type(rec.getExercise().getType().toString())
                        .difficulty(rec.getExercise().getDifficulty().toString())
                        .build())
                .reason(rec.getReason())
                .isAccepted(rec.getIsAccepted())
                .createdAt(rec.getCreatedAt())
                .build();
    }
}
