package com.SAH.backend.service.strategy;

import com.SAH.backend.entity.Exercise;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecommendedExercise {
    private Exercise exercise;
    private String reason;
}
