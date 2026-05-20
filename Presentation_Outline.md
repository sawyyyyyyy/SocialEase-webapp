# SocialEase – Final Presentation Outline

**Team:** Snaa Elsawy, Rana Mostafa, Miral Adel | **Group:** SE1

---

## Slide 1: Title Slide
- **SocialEase** – Social Anxiety Management Web Application
- Team members, group, date

## Slide 2: Problem & Solution
- **Problem:** Social anxiety affects millions; limited access to affordable, private practice tools
- **Solution:** Self-paced web app with exercises, assessments, simulations, and progress tracking

## Slide 3: Key Features
- User registration & authentication
- Anxiety assessments with scoring
- Interactive scenario simulations (4 scenarios)
- Live anxiety tracking during practice
- Personalized exercise recommendations
- Progress dashboard with streak tracking
- Audio guides & reading resources
- Support & FAQ section

## Slide 4: System Architecture
- 3-tier MVC architecture diagram
- Frontend (Vanilla JS SPA) → Backend (Spring Boot REST API) → Database (PostgreSQL)
- Deployment overview

## Slide 5: Design Patterns – Strategy
- **Category:** Behavioral
- **Used in:** Recommendation system
- `RecommendationStrategy` interface → `AnxietyBasedStrategy` + `ProgressBasedStrategy`
- Dynamically selects algorithm based on user profile

## Slide 6: Design Patterns – Builder
- **Category:** Creational
- **Used in:** 20+ classes (all entities + DTOs)
- Lombok `@Builder` annotation
- Fluent, readable object construction

## Slide 7: Design Patterns – Additional
- **Singleton:** All Spring beans (services, controllers, repositories)
- **Facade:** Service layer coordinates multiple repositories
- **Adapter:** Entity-to-DTO conversion methods
- **Proxy:** JPA lazy loading + Spring AOP transactions
- **MVC:** Full architectural separation

## Slide 8: Class Diagram
- Entity relationships (User → Assessments, UserExercises, Recommendations, ProgressRecords)
- Strategy pattern hierarchy
- Controller → Service → Repository mapping

## Slide 9: Implementation Highlights
- 30 backend Java files (8 controllers, 5 services, 8 entities, 21 DTOs)
- 12 frontend pages, 1000+ line JS module
- 9 database tables with JPA auto-schema
- JWT authentication with BCrypt
- 19 backend tests passing

## Slide 10: Demo
- Register/Login
- Dashboard with dynamic recommendations
- Anxiety assessment
- Coffee shop chat simulation with live anxiety bar
- Progress analysis with streak and chart
- Audio guide player
- Tips and reading list

## Slide 11: Challenges & Lessons Learned
- Evolving pattern selection (planned Factory/Observer → implemented Strategy/Builder)
- UI consistency across 12 pages
- State management without a framework
- Browser caching issues with development
- Database migration for new columns

## Slide 12: Q&A
- Thank you
- Questions?
