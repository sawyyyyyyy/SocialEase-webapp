package com.SAH.backend.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProgressMetricRequest {
    @NotBlank(message = "Metric name is required")
    private String metricName;

    @NotNull(message = "Metric value is required")
    @DecimalMin(value = "0", message = "Metric value must be non-negative")
    private BigDecimal metricValue;
}
