package com.SAH.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "audio_guides")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioGuide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false)
    private Integer durationSeconds;
}
