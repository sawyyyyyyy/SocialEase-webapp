# SocialEase API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
All endpoints except login/register require Bearer token authentication.
```
Authorization: Bearer <token>
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Assessments Table
```sql
CREATE TABLE assessments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    anxiety_level anxiety_level_enum NOT NULL,
    score INT,
    responses JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TYPE anxiety_level_enum AS ENUM ('LOW', 'MODERATE', 'HIGH', 'SEVERE');
```

### Exercises Table
```sql
CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    type exercise_type_enum NOT NULL,
    difficulty difficulty_enum NOT NULL,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE exercise_type_enum AS ENUM ('BREATHING', 'CONVERSATION', 'PUBLIC_SPEAKING', 'EYE_CONTACT', 'ROLE_PLAY');
CREATE TYPE difficulty_enum AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
```

### User_Exercises Table (Progress Tracking)
```sql
CREATE TABLE user_exercises (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'),
    completion_date TIMESTAMP NULL,
    score INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);
```

### Progress_Records Table
```sql
CREATE TABLE progress_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    metric_name VARCHAR(50),
    metric_value DECIMAL(5,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Recommendations Table
```sql
CREATE TABLE recommendations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    reason VARCHAR(255),
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);
```

---

## API Endpoints

### 1. User Module

#### Register User
```
POST /auth/register
```
**Request Body:**
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "age": 25
}
```
**Response:**
```json
{
    "status": "success",
    "message": "User registered successfully",
    "data": {
        "id": 1,
        "username": "string",
        "email": "string",
        "token": "jwt-token"
    }
}
```

#### Login
```
POST /auth/login
```
**Request Body:**
```json
{
    "email": "string",
    "password": "string"
}
```
**Response:**
```json
{
    "status": "success",
    "token": "jwt-token",
    "user": {
        "id": 1,
        "username": "string",
        "email": "string"
    }
}
```

#### Get User Profile
```
GET /users/profile
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "id": 1,
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "age": 25,
    "createdAt": "2026-05-02T23:00:00"
}
```

#### Update User Profile
```
PUT /users/profile
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "firstName": "string",
    "lastName": "string",
    "age": 26
}
```

---

### 2. Assessment Module

#### Create Assessment
```
POST /assessments
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "responses": {
        "q1": 3,
        "q2": 4,
        "q3": 2
    }
}
```
**Response:**
```json
{
    "id": 1,
    "userId": 1,
    "anxietyLevel": "MODERATE",
    "score": 45,
    "createdAt": "2026-05-02T23:00:00"
}
```

#### Get User Assessments
```
GET /assessments
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
    {
        "id": 1,
        "anxietyLevel": "MODERATE",
        "score": 45,
        "createdAt": "2026-05-02T23:00:00"
    }
]
```

#### Get Latest Assessment
```
GET /assessments/latest
```
**Headers:** `Authorization: Bearer <token>`

---

### 3. Exercise Module

#### Get All Exercises
```
GET /exercises
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (optional): Filter by exercise type
- `difficulty` (optional): Filter by difficulty level

**Response:**
```json
[
    {
        "id": 1,
        "title": "Deep Breathing",
        "description": "Practice slow breathing techniques",
        "type": "BREATHING",
        "difficulty": "BEGINNER",
        "durationMinutes": 10
    }
]
```

#### Get Exercise by ID
```
GET /exercises/{id}
```
**Headers:** `Authorization: Bearer <token>`

#### Start Exercise
```
POST /exercises/{id}/start
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "message": "Exercise started",
    "userExerciseId": 1,
    "startedAt": "2026-05-02T23:00:00"
}
```

#### Complete Exercise
```
POST /exercises/{id}/complete
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "score": 85,
    "notes": "Completed successfully"
}
```

---

### 4. Progress Tracker Module

#### Get Progress Summary
```
GET /progress/summary
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "totalExercises": 10,
    "completedExercises": 5,
    "averageScore": 78.5,
    "currentStreak": 3,
    "anxietyLevelTrend": "IMPROVING"
}
```

#### Get Progress History
```
GET /progress/history
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
[
    {
        "date": "2026-05-01",
        "metricName": "confidence_score",
        "metricValue": 75.5
    }
]
```

#### Record Progress Metric
```
POST /progress/metrics
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "metricName": "confidence_score",
    "metricValue": 80.5
}
```

---

### 5. Recommendation System Module

#### Get Personalized Recommendations
```
GET /recommendations
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
    {
        "id": 1,
        "exercise": {
            "id": 3,
            "title": "Public Speaking Practice",
            "type": "PUBLIC_SPEAKING",
            "difficulty": "INTERMEDIATE"
        },
        "reason": "Based on your recent progress in conversation exercises",
        "createdAt": "2026-05-02T23:00:00"
    }
]
```

#### Accept Recommendation
```
POST /recommendations/{id}/accept
```
**Headers:** `Authorization: Bearer <token>`

#### Dismiss Recommendation
```
DELETE /recommendations/{id}
```
**Headers:** `Authorization: Bearer <token>`

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

## Error Response Format
```json
{
    "status": "error",
    "message": "Error description",
    "timestamp": "2026-05-02T23:00:00"
}
```
