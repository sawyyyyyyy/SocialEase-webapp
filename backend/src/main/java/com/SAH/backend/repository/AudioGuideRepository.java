package com.SAH.backend.repository;

import com.SAH.backend.entity.AudioGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AudioGuideRepository extends JpaRepository<AudioGuide, Long> {
    List<AudioGuide> findAllByOrderByIdAsc();
}
