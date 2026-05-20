package com.SAH.backend.config;

import com.SAH.backend.entity.Exercise;
import com.SAH.backend.entity.ContentSettings;
import com.SAH.backend.entity.AudioGuide;
import com.SAH.backend.repository.ExerciseRepository;
import com.SAH.backend.repository.ContentSettingsRepository;
import com.SAH.backend.repository.AudioGuideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ContentSettingsRepository contentSettingsRepository;

    @Autowired
    private AudioGuideRepository audioGuideRepository;

    @Override
    public void run(String... args) {
        if (exerciseRepository.count() > 0) return;

        exerciseRepository.save(Exercise.builder()
                .title("Box Breathing")
                .description("Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 cycles.")
                .type(Exercise.ExerciseType.BREATHING)
                .difficulty(Exercise.Difficulty.BEGINNER)
                .durationMinutes(5)
                .build());

        exerciseRepository.save(Exercise.builder()
                .title("4-7-8 Breathing")
                .description("Inhale 4s, hold 7s, exhale 8s. Repeat 4 times.")
                .type(Exercise.ExerciseType.BREATHING)
                .difficulty(Exercise.Difficulty.BEGINNER)
                .durationMinutes(5)
                .build());

        exerciseRepository.save(Exercise.builder()
                .title("Coffee Shop Greeting")
                .description("Practice ordering coffee and making small talk with the barista.")
                .type(Exercise.ExerciseType.CONVERSATION)
                .difficulty(Exercise.Difficulty.BEGINNER)
                .durationMinutes(10)
                .build());

        exerciseRepository.save(Exercise.builder()
                .title("Asking for Directions")
                .description("Practice approaching a stranger and asking for directions.")
                .type(Exercise.ExerciseType.CONVERSATION)
                .difficulty(Exercise.Difficulty.INTERMEDIATE)
                .durationMinutes(10)
                .build());

        exerciseRepository.save(Exercise.builder()
                .title("Returning an Item")
                .description("Practice returning a purchase at a retail store.")
                .type(Exercise.ExerciseType.CONVERSATION)
                .difficulty(Exercise.Difficulty.INTERMEDIATE)
                .durationMinutes(10)
                .build());

        exerciseRepository.save(Exercise.builder()
                .title("Job Interview")
                .description("Practice answering common interview questions with confidence.")
                .type(Exercise.ExerciseType.CONVERSATION)
                .difficulty(Exercise.Difficulty.ADVANCED)
                .durationMinutes(15)
                .build());

        exerciseRepository.save(Exercise.builder()
                .title("Eye Contact Warm-Up")
                .description("Practice maintaining eye contact with a partner or mirror for increasing durations.")
                .type(Exercise.ExerciseType.EYE_CONTACT)
                .difficulty(Exercise.Difficulty.BEGINNER)
                .durationMinutes(5)
                .build());

        exerciseRepository.save(Exercise.builder()
                .title("Group Conversation Starter")
                .description("Practice joining a group conversation with a thoughtful comment or question.")
                .type(Exercise.ExerciseType.PUBLIC_SPEAKING)
                .difficulty(Exercise.Difficulty.ADVANCED)
                .durationMinutes(15)
                .build());

        exerciseRepository.save(Exercise.builder()
                .title("Self-Compassion Break")
                .description("A guided practice to acknowledge your feelings and respond with kindness.")
                .type(Exercise.ExerciseType.BREATHING)
                .difficulty(Exercise.Difficulty.BEGINNER)
                .durationMinutes(5)
                .build());

        exerciseRepository.save(Exercise.builder()
                .title("Social Gathering Role Play")
                .description("Simulate attending a small gathering with multiple conversation partners.")
                .type(Exercise.ExerciseType.ROLE_PLAY)
                .difficulty(Exercise.Difficulty.ADVANCED)
                .durationMinutes(20)
                .build());

        if (contentSettingsRepository.count() == 0) {
            contentSettingsRepository.save(ContentSettings.builder()
                    .recommendedDailyMin(10)
                    .recommendedDailyMax(15)
                    .averageResponseMinutes(5)
                    .researchMinutesDaily(10)
                    .researchImprovementPercent(40)
                    .researchDurationMonths(3)
                    .breathingGuidesCount(4)
                    .proTip("The barista is likely thinking about the long line, not your specific order. You're doing great!")
                    .build());
        } else {
            ContentSettings existing = contentSettingsRepository.findAll().get(0);
            if (existing.getProTip() == null) {
                existing.setProTip("The barista is likely thinking about the long line, not your specific order. You're doing great!");
                contentSettingsRepository.save(existing);
            }
        }

        if (audioGuideRepository.count() == 0) {
            audioGuideRepository.save(AudioGuide.builder().title("Pre-Party Confidence Boost").durationSeconds(300).build());
            audioGuideRepository.save(AudioGuide.builder().title("Releasing Post-Social Tension").durationSeconds(720).build());
            audioGuideRepository.save(AudioGuide.builder().title("Grounding in the Grocery Store").durationSeconds(210).build());
        }
    }
}
