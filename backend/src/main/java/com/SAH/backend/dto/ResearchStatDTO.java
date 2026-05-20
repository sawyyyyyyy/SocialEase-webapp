package com.SAH.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchStatDTO {
    private Integer minutesDaily;
    private Integer improvementPercent;
    private Integer durationMonths;
}
