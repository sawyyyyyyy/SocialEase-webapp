package com.SAH.backend.service;

import com.SAH.backend.dto.ExerciseDTO;
import com.SAH.backend.entity.Exercise;
import com.SAH.backend.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExerciseService {

    @Autowired
    private ExerciseRepository exerciseRepository;

    public List<ExerciseDTO> getAllExercises(String type, String difficulty) {
        List<Exercise> exercises;

        if (type != null && difficulty != null) {
            exercises = exerciseRepository.findByTypeAndDifficulty(
                    Exercise.ExerciseType.valueOf(type.toUpperCase()),
                    Exercise.Difficulty.valueOf(difficulty.toUpperCase())
            );
        } else if (type != null) {
            exercises = exerciseRepository.findByType(
                    Exercise.ExerciseType.valueOf(type.toUpperCase())
            );
        } else if (difficulty != null) {
            exercises = exerciseRepository.findByDifficulty(
                    Exercise.Difficulty.valueOf(difficulty.toUpperCase())
            );
        } else {
            exercises = exerciseRepository.findAll();
        }

        return exercises.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ExerciseDTO getExerciseById(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new com.SAH.backend.exception.ResourceNotFoundException("Exercise not found"));
        return convertToDTO(exercise);
    }

    public Exercise getExerciseEntity(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new com.SAH.backend.exception.ResourceNotFoundException("Exercise not found"));
    }

    private ExerciseDTO convertToDTO(Exercise exercise) {
        return ExerciseDTO.builder()
                .id(exercise.getId())
                .title(exercise.getTitle())
                .description(exercise.getDescription())
                .type(exercise.getType().toString())
                .difficulty(exercise.getDifficulty().toString())
                .durationMinutes(exercise.getDurationMinutes())
                .createdAt(exercise.getCreatedAt())
                .build();
    }
}
