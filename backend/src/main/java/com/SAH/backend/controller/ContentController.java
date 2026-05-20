package com.SAH.backend.controller;

import com.SAH.backend.dto.AudioGuideDTO;
import com.SAH.backend.dto.FrontendContentDTO;
import com.SAH.backend.dto.GuidesSummaryDTO;
import com.SAH.backend.dto.ResearchStatDTO;
import com.SAH.backend.dto.SupportInfoDTO;
import com.SAH.backend.repository.AudioGuideRepository;
import com.SAH.backend.repository.ContentSettingsRepository;
import com.SAH.backend.entity.AudioGuide;
import com.SAH.backend.entity.ContentSettings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/content")
@CrossOrigin(origins = "*")
public class ContentController {

    @Autowired
    private ContentSettingsRepository contentSettingsRepository;

    @Autowired
    private AudioGuideRepository audioGuideRepository;

    @GetMapping
    public ResponseEntity<?> getContent() {
        ContentSettings settings = contentSettingsRepository.findAll().stream().findFirst().orElse(null);
        List<AudioGuideDTO> guides = audioGuideRepository.findAllByOrderByIdAsc().stream()
                .map(a -> AudioGuideDTO.builder().title(a.getTitle()).durationSeconds(a.getDurationSeconds()).build())
                .collect(Collectors.toList());

        FrontendContentDTO payload = FrontendContentDTO.builder()
                .support(settings == null ? null : SupportInfoDTO.builder()
                        .recommendedDailyMin(settings.getRecommendedDailyMin())
                        .recommendedDailyMax(settings.getRecommendedDailyMax())
                        .averageResponseMinutes(settings.getAverageResponseMinutes())
                        .build())
                .research(settings == null ? null : ResearchStatDTO.builder()
                        .minutesDaily(settings.getResearchMinutesDaily())
                        .improvementPercent(settings.getResearchImprovementPercent())
                        .durationMonths(settings.getResearchDurationMonths())
                        .build())
                .guides(settings == null ? null : GuidesSummaryDTO.builder()
                        .breathingGuidesCount(settings.getBreathingGuidesCount())
                        .build())
                .audioGuides(guides)
                .proTip(settings == null ? null : settings.getProTip())
                .build();
        return ResponseEntity.ok(payload);
    }
}
