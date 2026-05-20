package com.SAH.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "content_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer recommendedDailyMin;

    @Column(nullable = false)
    private Integer recommendedDailyMax;

    @Column(nullable = false)
    private Integer averageResponseMinutes;

    @Column(nullable = false)
    private Integer researchMinutesDaily;

    @Column(nullable = false)
    private Integer researchImprovementPercent;

    @Column(nullable = false)
    private Integer researchDurationMonths;

    @Column(nullable = false)
    private Integer breathingGuidesCount;

    @Column(columnDefinition = "TEXT")
    private String proTip;
}
