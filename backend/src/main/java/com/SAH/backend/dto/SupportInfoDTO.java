package com.SAH.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportInfoDTO {
    private Integer recommendedDailyMin;
    private Integer recommendedDailyMax;
    private Integer averageResponseMinutes;
}
