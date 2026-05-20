package com.SAH.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrontendContentDTO {
    private SupportInfoDTO support;
    private ResearchStatDTO research;
    private GuidesSummaryDTO guides;
    private List<AudioGuideDTO> audioGuides;
    private String proTip;
}
