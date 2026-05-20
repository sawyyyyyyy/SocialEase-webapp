# SocialEase – Final Design Patterns Project Report

**Team Members:** Snaa Elsawy, Rana Mostafa, Miral Adel

**Group:** SE1

**Date:** May 18, 2026

**AI Assisted**

---

## 1. Final Project Title

**SocialEase – A Social Anxiety Management Web Application**

---

## 2. Final Project Description

SocialEase is an interactive web application designed to help individuals overcome social anxiety through personalized exercises, anxiety assessments, simulated conversation practice, and progress tracking. The system simulates real-life social scenarios (coffee shop interactions, asking for directions, job interviews, returning items), provides breathing exercises for immediate calming, and offers tailored exercise recommendations based on user progress and anxiety levels.

**Problem it solves:** Many people experience social anxiety but lack access to affordable, private, and structured tools to practice social interactions. Traditional therapy is expensive and not always accessible. SocialEase provides a self-paced, private environment where users can practice social scenarios, track their improvement, and build confidence gradually.

**Target users:** Individuals with mild to moderate social anxiety who want to improve their social skills through regular practice and self-assessment. The application is self-guided and does not require involvement from mental health professionals.

---

## 3. Requirements Summary

### Functional Requirements

| Module | Requirements |
|--------|-------------|
| **User Module** | Registration, login, profile management, logout |
| **Assessment Module** | Anxiety assessment with scored questions, assessment history, trend analysis |
| **Exercise Module** | Browse by type/difficulty, start exercises, complete with scores, 5 categories (Breathing, Conversation, Public Speaking, Eye Contact, Role-Play) |
| **Chat Simulation** | Interactive conversation practice with scenario-based AI responses, live anxiety tracking, progress percentage |
| **Audio Guides** | Simulated guided meditation player with save/bookmark functionality |
| **Reading List** | Curated reading materials with expandable details and save/bookmark |
| **Progress Tracker** | Summary statistics, history, streak tracking, daily scores visualization, achievement badges |
| **Recommendation System** | Personalized exercise suggestions based on anxiety level and past progress |
| **Dashboard** | Overview of progress, personalized recommendations, confidence score, daily scores chart |
| **Support** | FAQ section, support ticket submission via contact form |
| **Content Management** | Admin-configurable content settings and audio guides via database |

### Non-Functional Requirements

| Category | Requirements |
|----------|-------------|
| **Performance** | Response under 2 seconds, support 100 concurrent users |
| **Security** | BCrypt password hashing, JWT authentication, input validation |
| **Usability** | Intuitive interface, responsive design (desktop + mobile), clear error messages |
| **Reliability** | Graceful error handling, graceful fallback when backend is unavailable |
| **Scalability** | Modular architecture, easy addition of new exercise types and assessment questions |

---

## 4. Final System Architecture

### Architecture Style: Layered MVC Architecture

SocialEase follows a three-tier architecture with clear separation of concerns:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                                │
│            (HTML / CSS / Tailwind / Vanilla JavaScript)                  │
│                                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Dashboard│ │Assessment│ │ Exercises│ │ Progress │ │  Chat    │     │
│  │  Page    │ │  Page    │ │  Page    │ │  Page    │ │  Page    │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ Settings │ │ Support  │ │ Tips     │ │  Login/  │                  │
│  │  Page    │ │  Page    │ │  Page    │ │ Register │                  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                  │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                         HTTP/REST API
                      (localhost:8080/api/v1)
                              │
┌──────────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER (Spring Boot)                      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              CONTROLLER LAYER (MVC Controllers)                  │   │
│  │  AuthController │ UserController │ AssessmentController          │   │
│  │  ExerciseController │ ProgressController │ RecommendationController│   │
│  │  ContentController │ SupportController                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              SERVICE LAYER (Business Logic)                      │   │
│  │  UserService │ AssessmentService │ ExerciseService               │   │
│  │  ProgressService │ RecommendationService │ JwtTokenProvider       │   │
│  │  ┌──────────────────────────────────────────────┐                │   │
│  │  │  STRATEGY PATTERN                             │                │   │
│  │  │  RecommendationStrategy (interface)            │                │   │
│  │  │  ├── AnxietyBasedStrategy                      │                │   │
│  │  │  └── ProgressBasedStrategy                     │                │   │
│  │  └──────────────────────────────────────────────┘                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              REPOSITORY LAYER (Data Access)                      │   │
│  │  UserRepository │ ExerciseRepository │ AssessmentRepository      │   │
│  │  UserExerciseRepository │ ProgressRecordRepository               │   │
│  │  RecommendationRepository │ ContentSettingsRepository            │   │
│  │  AudioGuideRepository                                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              │ JDBC
┌──────────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (PostgreSQL)                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Users   │ │Assessments│ │Exercises │ │User_Exer-│ │Progress_ │     │
│  │          │ │          │ │          │ │cises     │ │Records   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │Recom-    │ │Content_  │ │Audio_    │ │Password_ │                  │
│  │mendations│ │Settings  │ │Guides    │ │Reset     │                  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture (Client-Side)

The frontend follows a Single-Page Application (SPA) pattern with a module-style JavaScript architecture:

```
app.js (IIFE Module)
  ├── LS (localStorage utility: get/set/remove with 'se_' prefix)
  ├── API (HTTP client: get/post/put wrapping fetch + JWT headers)
  └── App (Main application object)
       ├── init() ─── Bootstraps page routing and display
       ├── login() ─── Login form handler
       ├── register() ─── Registration form handler
       ├── dashboard() ─── Dashboard page logic
       ├── assessment() ─── Assessment questionnaire
       ├── chat() ─── Chat/simulation page
       ├── scinario() ─── Practice scenario page
       ├── analysis() ─── Progress analysis page
       ├── settings() ─── Settings/profile management
       ├── support() ─── Support/FAQ page
       ├── tip() ─── Tips and resources page
       └── loadContent() ─── Fetches dynamic content from API
```

### Deployment Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │  HTTP   │ Python HTTP  │         │  PostgreSQL  │
│  (Frontend)  │◄───────►│   Server     │         │  Database    │
│  localhost:  │         │  localhost:  │         │  localhost:  │
│    8000      │         │    8080      │         │    5432      │
└──────────────┘         └──────┬───────┘         └──────────────┘
                                │                         ▲
                                │ HTTP REST API            │ JDBC
                                ▼                         │
                        ┌──────────────┐                  │
                        │ Spring Boot  ├──────────────────┘
                        │  Backend     │
                        │ localhost:   │
                        │   8080       │
                        └──────────────┘
```

---

## 5. Final Class Diagram

### Entity Classes (Model Layer)

```
┌─────────────────────────────┐       ┌─────────────────────────────┐
│           User              │       │        Exercise             │
├─────────────────────────────┤       ├─────────────────────────────┤
│ - id: Long                  │       │ - id: Long                  │
│ - username: String          │       │ - title: String             │
│ - email: String             │       │ - description: String       │
│ - passwordHash: String      │       │ - type: ExerciseType        │
│ - firstName: String         │       │ - difficulty: Difficulty    │
│ - lastName: String          │       │ - durationMinutes: Integer  │
│ - age: Integer              │       │ - createdAt: LocalDateTime  │
│ - createdAt: LocalDateTime  │       └──────────────┬──────────────┘
│ - updatedAt: LocalDateTime  │                      │
└──────────────┬──────────────┘                      │
       │                        ┌────────────────────┼────────────────────┐
       │                        │                    │                    │
       ▼                        ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Assessment     │  │  UserExercise    │  │  Recommendation  │  │  ProgressRecord  │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ - id: Long       │  │ - id: Long       │  │ - id: Long       │  │ - id: Long       │
│ - user: User     │  │ - user: User     │  │ - user: User     │  │ - user: User     │
│ - anxietyLevel   │  │ - exercise: Ex.  │  │ - exercise: Ex.  │  │ - metricName     │
│ - score: Integer │  │ - status: Status │  │ - reason: String │  │ - metricValue    │
│ - responses: JSON│  │ - score: Integer │  │ - isAccepted     │  │ - recordedAt     │
│ - createdAt      │  │ - completionDate│  │ - createdAt      │  └──────────────────┘
└──────────────────┘  │ - notes: String  │  └──────────────────┘
                      │ - createdAt      │
                      │ - updatedAt      │
                      └──────────────────┘

┌─────────────────────────────┐  ┌─────────────────────────────┐
│       ContentSettings       │  │        AudioGuide           │
├─────────────────────────────┤  ├─────────────────────────────┤
│ - id: Long                  │  │ - id: Long                  │
│ - recommendedDailyMin: Int  │  │ - title: String             │
│ - recommendedDailyMax: Int  │  │ - durationSeconds: Integer  │
│ - averageResponseMinutes:Int│  └─────────────────────────────┘
│ - researchMinutesDaily: Int │
│ - researchImprovementPct:Int│
│ - researchDurationMonths:Int│
│ - breathingGuidesCount: Int │
│ - proTip: String            │
└─────────────────────────────┘
```

### Strategy Pattern Classes

```
┌─────────────────────────────────────┐
│ <<interface>>                       │
│   RecommendationStrategy            │
├─────────────────────────────────────┤
│ + recommendExercises(User,          │
│     List<Assessment>): List<        │
│     RecommendedExercise>            │
└──────────┬──────────────────────────┘
           │ implements
    ┌──────┴──────┐
    ▼              ▼
┌────────────────────┐  ┌────────────────────┐
│ AnxietyBasedStrat. │  │ ProgressBasedStrat.│
├────────────────────┤  ├────────────────────┤
│ + recommendExercis │  │ + recommendExercis │
│   es()             │  │   es()             │
└────────────────────┘  └────────────────────┘

┌─────────────────────────────────────┐
│       RecommendationService         │   ◄── Uses both strategies
├─────────────────────────────────────┤
│ + getRecommendations(userId): List  │
│   of RecommendationDTO              │
└─────────────────────────────────────┘
```

### Controller Layer

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│AuthController│  │UserController│  │ExerciseCtrl  │  │AssessmentCtrl│
│POST /register│  │GET /profile  │  │GET /exercises│  │POST /assess  │
│POST /login   │  │PUT /profile  │  │POST /{id}/   │  │GET /assess   │
└──────────────┘  │PUT /password │  │  start       │  │GET /latest   │
                  │DELETE /me    │  │POST /{id}/   │  └──────────────┘
                  └──────────────┘  │  complete    │
                                    │GET /history  │
┌──────────────┐  ┌──────────────┐  └──────────────┘
│ProgressCtrl  │  │RecommendCtrl │  ┌──────────────┐  ┌──────────────┐
│GET /summary  │  │GET /recomms  │  │ContentCtrl   │  │SupportCtrl   │
│GET /history  │  │POST /{id}/   │  │GET /content  │  │POST /support │
│POST /metrics │  │  accept      │  └──────────────┘  └──────────────┘
└──────────────┘  │DELETE /{id}  │
                  └──────────────┘
```

---

## 6. Applied Design Patterns

### Pattern 1: Strategy Pattern

| Property | Description |
|----------|-------------|
| **Category** | Behavioral |
| **Where it is used** | Recommendation System – generating personalized exercise suggestions |
| **Why it is suitable** | The system needs to recommend exercises differently based on user profiles. A beginner with high anxiety needs different recommendations than an advanced user who has completed many exercises. The Strategy pattern lets us define separate algorithms (anxiety-based vs progress-based) and use them interchangeably. |
| **Classes involved** | `RecommendationStrategy` (interface), `AnxietyBasedStrategy`, `ProgressBasedStrategy`, `RecommendedExercise` (data class), `RecommendationService` (context) |
| **Benefit** | New recommendation algorithms can be added without changing existing code. Each strategy is isolated and testable independently. The system can use multiple strategies together to provide richer recommendations. |

**Implementation details:**
- `RecommendationService.getRecommendations()` instantiates both strategies and collects recommendations from each
- `AnxietyBasedStrategy` analyzes the user's assessment anxiety scores and recommends exercises targeting their specific anxiety triggers
- `ProgressBasedStrategy` examines past completed exercises and recommends new exercises that build on existing skills, following a progressive difficulty curve

**File locations:**
- `backend/src/main/java/com/SAH/backend/service/strategy/RecommendationStrategy.java` (interface)
- `backend/src/main/java/com/SAH/backend/service/strategy/AnxietyBasedStrategy.java` (concrete strategy)
- `backend/src/main/java/com/SAH/backend/service/strategy/ProgressBasedStrategy.java` (concrete strategy)
- `backend/src/main/java/com/SAH/backend/service/RecommendationService.java` (context)

---

### Pattern 2: Builder Pattern

| Property | Description |
|----------|-------------|
| **Category** | Creational |
| **Where it is used** | Object construction across the entire codebase – entities, DTOs, and response objects |
| **Why it is suitable** | Many classes have multiple optional fields (e.g., `UserExercise` has status, score, completionDate, notes, timestamps). Constructor-based creation with many parameters is error-prone and hard to read. The Builder pattern provides a fluent, readable API for constructing complex objects. |
| **Classes involved** | All 8 entity classes (`User`, `Exercise`, `UserExercise`, `Assessment`, `ProgressRecord`, `Recommendation`, `ContentSettings`, `AudioGuide`), all 13 DTO classes (e.g., `ExerciseDTO`, `UserDTO`, `ProgressSummaryDTO`, `FrontendContentDTO`, etc.), and `ErrorResponse` |
| **Benefit** | Readable object construction with named fields, immutability support, reduced constructor overloads, consistent pattern across the codebase. The Builder is used extensively in `DataInitializer`, all services, and all controllers. |

**Implementation details:**
- Implemented via Lombok `@Builder` annotation on all entity and DTO classes
- Usage pattern: `Entity.builder().field1(value1).field2(value2).build();`
- **24+ classes** use this pattern across the codebase

---

### Pattern 3: Singleton Pattern

| Property | Description |
|----------|-------------|
| **Category** | Creational |
| **Where it is used** | All Spring-managed beans – services, repositories, controllers, configuration |
| **Why it is suitable** | Spring beans are singletons by default. Having a single instance of each service ensures consistent state management, efficient resource usage (no repeated instantiation), and thread-safe access to shared resources like database connections. |
| **Classes involved** | All 5 `@Service` classes (`UserService`, `ExerciseService`, `AssessmentService`, `ProgressService`, `RecommendationService`), all 8 `@RestController` classes, all 8 `@Repository` interfaces, `@Configuration` (`SecurityConfig`), `@Component` (`JwtTokenProvider`, `DataInitializer`), `@RestControllerAdvice` (`GlobalExceptionHandler`) |
| **Benefit** | Reduced memory footprint (single instance per class), consistent behavior across the application, centralized control of shared resources, automatic dependency injection via Spring IoC container. |

---

### Pattern 4: Facade Pattern

| Property | Description |
|----------|-------------|
| **Category** | Structural |
| **Where it is used** | Service layer – each service wraps multiple repositories and provides a unified interface to controllers |
| **Why it is suitable** | Controllers should not interact with multiple repositories directly. Each service acts as a facade that coordinates data access, applies business rules, and returns a clean result. |
| **Classes involved** | `UserService` (wraps 6 dependencies), `ProgressService` (wraps 4 repositories), `RecommendationService` (wraps 5 repositories), `AssessmentService` (wraps 3 dependencies), `ExerciseService` (wraps 1 repository) |
| **Benefit** | Simplified controller logic, centralized business rules, easier testing (mock the service, not all repositories), loose coupling between layers. |

---

### Pattern 5: Adapter Pattern

| Property | Description |
|----------|-------------|
| **Category** | Structural |
| **Where it is used** | Entity-to-DTO conversion in all service classes |
| **Why it is suitable** | The internal entity model (JPA entities with lazy loading, bidirectional relationships) should not be exposed directly to the API layer. DTOs provide a clean, serializable representation. The `convertToDTO` methods adapt between these two representations. |
| **Classes involved** | `ExerciseService.convertToDTO()`, `UserService.convertToDTO()`, `ProgressService.convertToDTO()`, `AssessmentService.convertToDTO()`, `RecommendationService.convertToDTO()` |
| **Benefit** | Clean separation between internal data model and API contract, prevents lazy loading issues in serialization, allows different entity-to-DTO mappings for different use cases. |

---

### Pattern 6: Proxy Pattern

| Property | Description |
|----------|-------------|
| **Category** | Structural |
| **Where it is used** | JPA lazy loading via `FetchType.LAZY` and Spring AOP transactional proxies |
| **Why it is suitable** | Related entities should only be loaded from the database when actually accessed. JPA creates proxy objects for lazy-loaded relationships, deferring database queries until needed. |
| **Classes involved** | 6 `@ManyToOne(fetch = FetchType.LAZY)` fields across `UserExercise`, `Assessment`, `ProgressRecord`, `Recommendation`; 5 `@Transactional` service classes |
| **Benefit** | Improved performance by avoiding unnecessary database queries, reduced memory usage, transparent to the developer. |

---

### Pattern 7: MVC (Model-View-Controller) Architectural Pattern

| Property | Description |
|----------|-------------|
| **Category** | Architectural |
| **Where it is used** | The entire application structure |
| **Why it is suitable** | Spring Boot is built on MVC. This separation allows parallel development, independent testing of each layer, and clean organization of business logic (Model: entities + DTOs, View: HTML/JS frontend, Controller: REST endpoints) |
| **Classes involved** | 8 Controllers, 5 Services, 8 Repositories, 8 Entities, 21 DTOs |
| **Benefit** | Clear separation of concerns, easier maintenance, natural fit with Spring Boot, support for team-based parallel development. |

---

## 7. Implementation / Prototype

### Implemented Features

#### Fully Implemented

| Feature | Description | Frontend | Backend |
|---------|-------------|----------|---------|
| **User Authentication** | Register, login, JWT-based session management | `login.html`, `register.html` | `AuthController`, `UserService` |
| **Profile Management** | View/update name, email, username, age, password change | `settings.html` | `UserController`, `UserService` |
| **Anxiety Assessment** | 8-question anxiety assessment with scoring | `assessment.html` | `AssessmentController`, `AssessmentService` |
| **Assessment History** | View past assessments with trend analysis | `analysis.html` | `AssessmentController` |
| **Exercise Library** | Browse 10 exercises by type and difficulty | `scinario.html` | `ExerciseController`, `ExerciseService` |
| **Exercise Completion** | Start and complete exercises with anxiety-based scoring | `scinario.html`, `chat.html` | `ExerciseController` |
| **Scenario Simulations** | 4 interactive scenarios (Coffee Shop, Directions, Returns, Interview) | `scinario.html`, `chat.html` | Exercise API |
| **Live Anxiety Tracking** | Real-time anxiety bar during practice sessions | `app.js` (`scinario()`, `chat()`) | N/A (client-side) |
| **Progress Dashboard** | Overall progress, recommendation card, daily scores chart | `dashboard.html` | `ProgressController` |
| **Progress Analysis** | Streak tracking, total time, sessions count, achievement badges | `analysis.html` | `ProgressController` |
| **Personalized Recommendations** | Exercise suggestions based on anxiety + progress | `dashboard.html` | `RecommendationController`, Strategy classes |
| **Tips & Resources** | Breathing guide count, audio guides, reading list with save | `tip.html` | `ContentController` |
| **Audio Guide Player** | Simulated audio player with play/pause, progress bar, save | `tip.html` | Audio guide data from API |
| **Reading List** | Expandable book details with save to localStorage | `tip.html` | N/A (client-side) |
| **Support Form** | Submit support requests, view FAQs | `support.html` | `SupportController` |
| **Dynamic Content** | Configurable tips, research stats, support info via DB | All pages | `ContentController`, `ContentSettings` |
| **Streak History Modal** | Modal showing grouped daily completions | `analysis.html` | Exercise history API |
| **Reminder Setter** | Set daily reminder time with modal time picker | `analysis.html` | N/A (localStorage) |
| **Saved Tips Modal** | View saved reading items and audio guides | `tip.html` | N/A (localStorage) |
| **Resource Suggestion** | Suggest resources via modal, submits to support endpoint | `tip.html` | `SupportController` |
| **Sign Out** | Clear auth state and redirect | Sidebar (all pages) | N/A (client-side) |

#### Partially Implemented

| Feature | Description | Limitation |
|---------|-------------|------------|
| **Audio Guides** | Modal player with progress bar | Simulated playback (1-second tick), no real audio files |
| **Exercise Scoring** | Anxiety-based score calculation | Anxiety bar increments use random bump, not NLP-based conversation analysis |
| **Support Form** | Accepts submissions via API | Not persisted to database (returns success message only) |

### Main Classes Created

**Backend (30 Java files):**
- 8 Entities: `User`, `Exercise`, `UserExercise`, `Assessment`, `ProgressRecord`, `Recommendation`, `ContentSettings`, `AudioGuide`
- 8 Controllers: `AuthController`, `UserController`, `ExerciseController`, `AssessmentController`, `ProgressController`, `RecommendationController`, `ContentController`, `SupportController`
- 5 Services: `UserService`, `ExerciseService`, `AssessmentService`, `ProgressService`, `RecommendationService`
- 2 Strategy classes: `AnxietyBasedStrategy`, `ProgressBasedStrategy`
- 1 Utility: `JwtTokenProvider`
- 2 Config: `SecurityConfig`, `DataInitializer`
- 1 Filter: `JwtAuthenticationFilter`
- 1 Exception Handler: `GlobalExceptionHandler`
- 21 DTOs

**Frontend (12 HTML pages + 1 JS + CSS):**
- Pages: `index.html`, `login.html`, `register.html`, `dashboard.html`, `assessment.html`, `scinario.html`, `chat.html`, `analysis.html`, `settings.html`, `tip.html`, `support.html`
- Script: `app.js` (~1000 lines, IIFE module pattern)
- Styling: Tailwind CSS via CDN

### Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Registered user accounts | id, username, email, password_hash, first_name, last_name, age |
| `exercises` | Exercise catalog | id, title, description, type (enum), difficulty (enum), duration_minutes |
| `user_exercises` | User-exercise tracking | id, user_id (FK), exercise_id (FK), status (enum), score, completion_date |
| `assessments` | Anxiety assessment records | id, user_id (FK), anxiety_level (enum), score, responses (JSONB) |
| `progress_records` | Progress metric history | id, user_id (FK), metric_name, metric_value, recorded_at |
| `recommendations` | Personalized exercise suggestions | id, user_id (FK), exercise_id (FK), reason, is_accepted |
| `content_settings` | Dynamic content configuration | recommended daily min/max, research stats, breathing guide count, pro tip |
| `audio_guides` | Audio guide catalog | title, duration_seconds |
| `password_reset_tokens` | Password reset tokens | user_id (FK), token, expiry |

### Screenshots

*(Screenshots would be inserted here in the final submission)*

### Incomplete Parts

1. **Real audio files** for audio guides – currently simulated with a 1-second interval timer
2. **Conversation sentiment analysis** – anxiety increments are randomized rather than based on actual message content
3. **Admin dashboard** – no admin interface for managing content_settings or audio_guides (can be edited directly in DB)
4. **Email notifications** – no real email sending for reminders or password reset
5. **Mobile responsive refinements** – some pages may need layout adjustments on small screens

---

## 8. GitHub Repository Link

**[https://github.com/YOUR_USERNAME/socialease](https://github.com/YOUR_USERNAME/socialease)**

*(Insert your actual GitHub repository link here)*

The repository includes:
- Source code (backend + frontend)
- README file with run instructions
- Clear folder structure
- SQL schema documentation
- API documentation

---

## 9. Testing Summary

### Backend Testing (Java / JUnit + Spring Boot Test)

| Test Case | Expected Result | Actual Result | Status |
|-----------|----------------|---------------|--------|
| Application context loads | No errors | Context loads successfully | ✅ Pass |
| User registration API | Creates user, returns token | Created successfully | ✅ Pass |
| User login API | Returns JWT token | Token returned | ✅ Pass |
| Get all exercises | Returns exercise list | Returns exercises | ✅ Pass |
| Filter exercises by type | Returns filtered results | Filtered correctly | ✅ Pass |
| Filter exercises by difficulty | Returns filtered results | Filtered correctly | ✅ Pass |
| Start exercise | Creates IN_PROGRESS record | Created with correct status | ✅ Pass |
| Complete exercise | Updates to COMPLETED with score | Updated correctly | ✅ Pass |
| Duplicate start attempt | Returns bad request | Returns error message | ✅ Pass |
| Exercise not found | Returns 404 | Returns error response | ✅ Pass |
| Get progress summary | Returns stats object | Returns summary with dailyScores and totalTime | ✅ Pass |
| Create assessment | Saves and returns score | Saved correctly | ✅ Pass |
| Get progress history | Returns metric records | Returns history | ✅ Pass |
| Record progress metric | Saves metric with timestamp | Saved correctly | ✅ Pass |
| Get recommendations | Returns personalized list | Returns recommendations | ✅ Pass |
| Get content settings | Returns content DTO | Returns with proTip | ✅ Pass |
| Submit support request | Returns success message | Accepted | ✅ Pass |
| Backend compiles | No errors | Compiles with `mvn compile` | ✅ Pass |
| All tests pass | All green | All tests pass with `mvn test` | ✅ Pass |

### Frontend Testing (Manual)

| Test Case | Expected Result | Actual Result | Status |
|-----------|----------------|---------------|--------|
| Registration form | Creates account and redirects | Works correctly | ✅ Pass |
| Login form | Authenticates and redirects | Works correctly | ✅ Pass |
| Dashboard loads | Shows progress and recommendations | Loads from API | ✅ Pass |
| Assessment submission | Calculates score and shows result | Works correctly | ✅ Pass |
| Scenario chat simulation | Responds to messages, updates anxiety bar | Works correctly | ✅ Pass |
| Exercise completion | Sends score, updates progress | Works correctly | ✅ Pass |
| Progress analysis page | Shows stats, streak, chart | Works correctly | ✅ Pass |
| Settings save | Updates profile via API | Works correctly | ✅ Pass |
| Support form submission | Sends ticket via API | Works correctly | ✅ Pass |
| Audio guide player | Plays/pauses, shows progress | Works correctly | ✅ Pass |
| Reading list save | Saves to localStorage, shows in modal | Works correctly | ✅ Pass |
| Streak history modal | Shows grouped completions | Works correctly | ✅ Pass |
| Reminder setter | Saves time to localStorage | Works correctly | ✅ Pass |
| Resource suggestion | Submits via support endpoint | Works correctly | ✅ Pass |
| Sign out | Clears auth, redirects to login | Works correctly | ✅ Pass |
| JavaScript syntax | No errors | `node -c app.js` passes | ✅ Pass |

---

## 10. Challenges and Lessons Learned

### Challenges

1. **Design Pattern Selection and Integration:** Choosing the right patterns for each component was challenging. We initially planned a Factory pattern for exercise creation and an Observer pattern for notifications, but as the project evolved, we found the Strategy pattern more useful for the recommendation system. The Builder pattern via Lombok proved more practical than a custom Factory for object creation.

2. **Frontend-Backend Synchronization:** Keeping the vanilla JavaScript frontend in sync with the Spring Boot backend required careful API design. We learned to always validate data on both sides and handle cases where the backend might be unavailable.

3. **State Management Without a Framework:** Managing application state (user session, current exercise, scenario selection) without React or Vue required a thoughtful localStorage-based approach. We created a custom `LS` utility with prefix keys to avoid naming collisions.

4. **JWT Authentication Flow:** Implementing secure JWT authentication with token storage and automatic header injection in all API calls required careful design of the `API` utility object.

5. **Anxiety Score Calculation:** Designing a meaningful scoring system for exercises was difficult. We initially used random scores, then evolved to anxiety-bar-based calculations that inversely correlate anxiety level with performance score.

6. **Browser Caching:** Aggressive browser caching of `app.js` caused many development iterations to appear broken. We learned to use hard refresh (Ctrl+Shift+R) and added cache-busting awareness to our workflow.

7. **Consistent UI Across Pages:** Maintaining identical sidebar and header styling across 12 HTML pages required careful attention. Each page had slightly different classes, leading to visual inconsistencies that had to be systematically fixed.

8. **Database Migration:** Adding new columns (like `proTip` to `content_settings`) after the database was seeded required handling existing records in the `DataInitializer` to backfill missing values.

### Lessons Learned

1. **Design patterns are guidelines, not rules.** Our initial plan included Factory and Observer patterns, but the actual implementation evolved to use Builder, Strategy, Facade, Adapter, and Proxy patterns instead — better suited to our actual needs.

2. **Spring Boot naturally encourages good design patterns.** The framework's dependency injection naturally implements Singleton, its transaction management uses Proxy, and its layered architecture follows MVC.

3. **Build what users actually interact with first.** We spent too much time planning patterns and not enough on the chat simulation and progress tracking, which turned out to be the most impactful features.

4. **Documentation should evolve with the code.** Our initial design document specified Factory and Observer patterns that were never implemented. The final documentation should always reflect the actual codebase.

5. **Frontend matters as much as backend.** Users judge the application by what they see and interact with. Clean UI, responsive feedback (toasts, modals), and smooth transitions significantly impact user experience.

6. **LocalStorage is sufficient for client-side state in small applications.** For an app of this scale, we didn't need a state management library. The `LS` utility with prefixed keys was clean and sufficient.

7. **Standardizing UI components early prevents cascading fixes.** Had we used a consistent sidebar template from the start, we would have avoided the many rounds of navbar fixes across all pages.

---

## 11. Team Contribution

| Team Member | Contribution |
|-------------|-------------|
| **Snaa Elsawy** | Backend development (User/Exercise/Progress controllers and services), database schema design, JWT authentication, frontend integration (dashboard, analysis, settings), recommendation system strategy pattern, report writing |
| **Rana Mostafa** | Frontend development (assessment, chat simulation, scenario pages), UI/UX design with Tailwind CSS, anxiety tracking live updates, audio guide and reading list features, system architecture design, documentation |
| **Miral Adel** | Backend development (Assessment/Recommendation controllers and services), content management system (ContentSettings + AudioGuide), DataInitializer seed data, frontend pages (login, register, tip, support), testing, class diagram design |

---

### 
