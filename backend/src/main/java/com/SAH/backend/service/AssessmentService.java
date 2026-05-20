package com.SAH.backend.service;

import com.SAH.backend.dto.*;
import com.SAH.backend.entity.*;
import com.SAH.backend.repository.*;
import com.SAH.backend.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AssessmentDTO createAssessment(Long userId, CreateAssessmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int score = calculateScore(request.getResponses());
        Assessment.AnxietyLevel anxietyLevel = determineAnxietyLevel(score);

        Assessment assessment = Assessment.builder()
                .user(user)
                .score(score)
                .anxietyLevel(anxietyLevel)
                .responses(request.getResponses())
                .build();

        assessment = assessmentRepository.save(assessment);
        return convertToDTO(assessment);
    }

    public List<AssessmentDTO> getUserAssessments(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return assessmentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AssessmentDTO getLatestAssessment(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return assessmentRepository.findLatestByUserId(userId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    private int calculateScore(String responsesJson) {
        int total = 0;
        try {
            JsonNode root = objectMapper.readTree(responsesJson);
            if (root.isObject()) {
                for (JsonNode node : root) {
                    if (node.isInt()) {
                        total += node.asInt();
                    }
                }
            } else if (root.isArray()) {
                for (JsonNode node : root) {
                    if (node.isInt()) {
                        total += node.asInt();
                    }
                }
            }
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid responses JSON");
        }
        return total;
    }

    private Assessment.AnxietyLevel determineAnxietyLevel(int score) {
        if (score <= 15) return Assessment.AnxietyLevel.LOW;
        if (score <= 24) return Assessment.AnxietyLevel.MODERATE;
        if (score <= 32) return Assessment.AnxietyLevel.HIGH;
        return Assessment.AnxietyLevel.SEVERE;
    }

    private AssessmentDTO convertToDTO(Assessment assessment) {
        return AssessmentDTO.builder()
                .id(assessment.getId())
                .userId(assessment.getUser().getId())
                .anxietyLevel(assessment.getAnxietyLevel().toString())
                .score(assessment.getScore())
                .responses(assessment.getResponses())
                .createdAt(assessment.getCreatedAt())
                .build();
    }
}
