package com.SAH.backend.service;

import com.SAH.backend.dto.*;
import com.SAH.backend.entity.*;
import com.SAH.backend.repository.*;
import com.SAH.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProgressService {

    @Autowired
    private ProgressRecordRepository progressRecordRepository;

    @Autowired
    private UserExerciseRepository userExerciseRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private UserRepository userRepository;

    public ProgressSummaryDTO getProgressSummary(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<UserExercise> allExercises = userExerciseRepository.findByUserId(userId);
        long completedCount = userExerciseRepository.countByUserIdAndStatus(userId, UserExercise.Status.COMPLETED);

        double averageScore = allExercises.stream()
                .filter(e -> e.getScore() != null)
                .mapToInt(UserExercise::getScore)
                .average()
                .orElse(0.0);

        int streak = calculateStreak(userId);

        List<Assessment> assessments = assessmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        String trend = calculateTrend(assessments);

        int[] dailyScores = computeDailyScores(userId);
        int totalTimeMinutes = computeTotalTimeMinutes(allExercises);

        return ProgressSummaryDTO.builder()
                .totalExercises(allExercises.size())
                .completedExercises((int) completedCount)
                .averageScore(averageScore)
                .currentStreak(streak)
                .anxietyLevelTrend(trend)
                .dailyScores(dailyScores)
                .totalTimeMinutes(totalTimeMinutes)
                .build();
    }

    public List<ProgressRecordDTO> getProgressHistory(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return progressRecordRepository.findByUserIdOrderByRecordedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProgressRecordDTO recordMetric(Long userId, CreateProgressMetricRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ProgressRecord record = ProgressRecord.builder()
                .user(user)
                .metricName(request.getMetricName())
                .metricValue(request.getMetricValue())
                .build();

        record = progressRecordRepository.save(record);
        return convertToDTO(record);
    }

    private int[] computeDailyScores(Long userId) {
        int[] scores = new int[7];
        List<UserExercise> completed = userExerciseRepository.findByUserIdAndStatus(userId, UserExercise.Status.COMPLETED);
        if (completed.isEmpty()) return scores;

        LocalDate today = LocalDate.now();
        Map<LocalDate, List<Integer>> dayScores = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            dayScores.put(today.minusDays(i), new ArrayList<>());
        }

        for (UserExercise ue : completed) {
            if (ue.getCompletionDate() == null || ue.getScore() == null) continue;
            LocalDate day = ue.getCompletionDate().toLocalDate();
            if (dayScores.containsKey(day)) {
                dayScores.get(day).add(ue.getScore());
            }
        }

        for (int i = 0; i < 7; i++) {
            LocalDate day = today.minusDays(6 - i);
            List<Integer> dayScoresList = dayScores.get(day);
            if (dayScoresList != null && !dayScoresList.isEmpty()) {
                scores[i] = (int) Math.round(dayScoresList.stream().mapToInt(v -> v).average().orElse(0));
            }
        }
        return scores;
    }

    private int computeTotalTimeMinutes(List<UserExercise> allExercises) {
        return allExercises.stream()
                .filter(ue -> ue.getStatus() == UserExercise.Status.COMPLETED)
                .filter(ue -> ue.getExercise() != null && ue.getExercise().getDurationMinutes() != null)
                .mapToInt(ue -> ue.getExercise().getDurationMinutes())
                .sum();
    }

    private int calculateStreak(Long userId) {
        List<UserExercise> completed = userExerciseRepository.findByUserIdAndStatus(userId, UserExercise.Status.COMPLETED);
        if (completed.isEmpty()) return 0;

        completed.sort((a, b) -> b.getCompletionDate().compareTo(a.getCompletionDate()));

        int streak = 1;
        LocalDateTime prev = completed.get(0).getCompletionDate().toLocalDate().atStartOfDay();
        for (int i = 1; i < completed.size(); i++) {
            LocalDateTime curr = completed.get(i).getCompletionDate().toLocalDate().atStartOfDay();
            if (prev.minusDays(1).equals(curr)) {
                streak++;
                prev = curr;
            } else {
                break;
            }
        }
        return Math.min(streak, 30);
    }

    private String calculateTrend(List<Assessment> assessments) {
        if (assessments.size() < 2) return "STABLE";

        Assessment latest = assessments.get(0);
        Assessment previous = assessments.get(1);

        int latestScore = latest.getScore() != null ? latest.getScore() : 0;
        int previousScore = previous.getScore() != null ? previous.getScore() : 0;

        if (latestScore < previousScore) return "IMPROVING";
        if (latestScore > previousScore) return "DECLINING";
        return "STABLE";
    }

    private ProgressRecordDTO convertToDTO(ProgressRecord record) {
        return ProgressRecordDTO.builder()
                .id(record.getId())
                .userId(record.getUser().getId())
                .metricName(record.getMetricName())
                .metricValue(record.getMetricValue())
                .recordedAt(record.getRecordedAt())
                .build();
    }
}
