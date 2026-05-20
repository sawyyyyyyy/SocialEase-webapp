package com.SAH.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressRecordDTO {
    private Long id;
    private Long userId;
    private String metricName;
    private BigDecimal metricValue;
    private LocalDateTime recordedAt;
}
