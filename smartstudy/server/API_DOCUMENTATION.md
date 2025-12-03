# SmartStudy API Documentation

**Base URL**: `http://localhost:5000/api`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [Events](#events)
3. [Tasks](#tasks)
4. [Notes](#notes)
5. [Pomodoro](#pomodoro)
6. [Timetable](#timetable)
7. [Chatbot](#chatbot)
8. [Error Responses](#error-responses)

---

## Authentication

All endpoints except signup and login require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### POST /auth/signup

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation:**
- `name`: 2-50 characters, required
- `email`: Valid email format, required, unique
- `password`: Minimum 6 characters with at least one number, required

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "preferences": {
      "pomodoroSettings": {
        "workDuration": 25,
        "shortBreak": 5,
        "longBreak": 15,
        "sessionsBeforeLongBreak": 4
      },
      "theme": "system",
      "notifications": true
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

### POST /auth/login

Login to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "preferences": { ... }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### GET /auth/me

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePicture": null,
    "preferences": { ... },
    "createdAt": "2025-11-13T10:00:00.000Z",
    "updatedAt": "2025-11-13T10:00:00.000Z"
  }
}
```

---

### PUT /auth/me

Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "profilePicture": "https://example.com/avatar.jpg",
  "preferences": {
    "theme": "dark",
    "notifications": false,
    "pomodoroSettings": {
      "workDuration": 30,
      "shortBreak": 10
    }
  }
}
```

**Allowed Fields**: `name`, `profilePicture`, `preferences`

**Success Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### PUT /auth/password

Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

---

## Events

### GET /events

Get all events for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start` (optional): ISO 8601 date string - filter events starting from this date
- `end` (optional): ISO 8601 date string - filter events ending before this date

**Example:**
```
GET /api/events?start=2025-11-13T00:00:00Z&end=2025-11-20T23:59:59Z
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "events": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "title": "Math Lecture",
      "start": "2025-11-14T09:00:00.000Z",
      "end": "2025-11-14T10:30:00.000Z",
      "allDay": false,
      "type": "course",
      "courseCode": "MATH101",
      "location": "Room 204",
      "notes": "Bring calculator",
      "color": "#3B82F6",
      "isRecurring": false,
      "createdAt": "2025-11-13T10:00:00.000Z",
      "updatedAt": "2025-11-13T10:00:00.000Z"
    }
  ]
}
```

---

### GET /events/:id

Get a single event by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "event": { ... }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Event not found"
}
```

---

### POST /events

Create a new event.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Study Session",
  "start": "2025-11-15T14:00:00.000Z",
  "end": "2025-11-15T16:00:00.000Z",
  "allDay": false,
  "type": "event",
  "courseCode": "CS101",
  "location": "Library",
  "notes": "Chapter 5-7",
  "color": "#10B981",
  "isRecurring": false
}
```

**Validation:**
- `title`: Required, max 200 characters
- `start`: Required, ISO 8601 date
- `end`: Required, ISO 8601 date, must be after start
- `type`: "event" or "course"
- `allDay`: Boolean
- `courseCode`: Max 20 characters
- `location`: Max 100 characters
- `notes`: Max 1000 characters

**Success Response (201):**
```json
{
  "success": true,
  "event": { ... }
}
```

---

### PUT /events/:id

Update an existing event.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Study Session",
  "start": "2025-11-15T15:00:00.000Z",
  "end": "2025-11-15T17:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "event": { ... }
}
```

---

### DELETE /events/:id

Delete an event.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

---

## Tasks

### GET /tasks

Get all tasks for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: "completed" | "pending" | "all"
- `priority`: "low" | "medium" | "high"
- `courseCode`: Filter by course code

**Example:**
```
GET /api/tasks?status=pending&priority=high
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "title": "Complete assignment",
      "description": "Finish questions 1-10",
      "done": false,
      "due": "2025-11-20T23:59:59.000Z",
      "priority": "high",
      "relatedCourseCode": "CS101",
      "relatedEventId": null,
      "tags": ["homework", "programming"],
      "subtasks": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "title": "Question 1-5",
          "completed": true
        },
        {
          "_id": "507f1f77bcf86cd799439014",
          "title": "Question 6-10",
          "completed": false
        }
      ],
      "pomodoroCount": 2,
      "order": 0,
      "notes": "Use textbook chapter 3",
      "createdAt": "2025-11-13T10:00:00.000Z",
      "updatedAt": "2025-11-13T12:00:00.000Z"
    }
  ]
}
```

---

### GET /tasks/:id

Get a single task by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "task": { ... }
}
```

---

### POST /tasks

Create a new task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Study for exam",
  "description": "Review chapters 1-5",
  "priority": "high",
  "due": "2025-11-25T23:59:59.000Z",
  "relatedCourseCode": "MATH101",
  "tags": ["exam", "important"],
  "subtasks": [
    { "title": "Chapter 1", "completed": false },
    { "title": "Chapter 2", "completed": false }
  ]
}
```

**Validation:**
- `title`: Required, max 200 characters
- `description`: Max 1000 characters
- `priority`: "low", "medium", or "high"
- `due`: ISO 8601 date
- `done`: Boolean

**Success Response (201):**
```json
{
  "success": true,
  "task": { ... }
}
```

---

### PUT /tasks/:id

Update a task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated task title",
  "done": true,
  "priority": "medium"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "task": { ... }
}
```

---

### PATCH /tasks/:id/toggle

Toggle task completion status.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "task": { ... }
}
```

---

### DELETE /tasks/:id

Delete a task.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

---

### GET /tasks/stats/summary

Get task statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "total": 15,
    "completed": 8,
    "pending": 7,
    "overdue": 2,
    "byPriority": {
      "high": 3,
      "medium": 2,
      "low": 2
    }
  }
}
```

---

## Notes

### GET /notes

Get all notes for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `courseCode`: Filter by course code
- `tag`: Filter by tag
- `folder`: Filter by folder
- `pinned`: "true" | "false"

**Example:**
```
GET /api/notes?courseCode=CS101&pinned=true
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "notes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "title": "Data Structures Notes",
      "content": "# Arrays\n\nAn array is...",
      "relatedCourseCode": "CS101",
      "tags": ["data-structures", "arrays"],
      "isPinned": true,
      "color": "#FFFFFF",
      "folder": "Computer Science",
      "attachments": [],
      "createdAt": "2025-11-13T10:00:00.000Z",
      "updatedAt": "2025-11-13T15:00:00.000Z"
    }
  ]
}
```

---

### GET /notes/search

Search notes by title and content.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q`: Search query (required)

**Example:**
```
GET /api/notes/search?q=algorithms
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "notes": [ ... ]
}
```

---

### GET /notes/:id

Get a single note by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "note": { ... }
}
```

---

### POST /notes

Create a new note.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Algorithms Lecture",
  "content": "# Sorting Algorithms\n\n## Bubble Sort\n...",
  "relatedCourseCode": "CS201",
  "tags": ["algorithms", "sorting"],
  "folder": "Computer Science",
  "color": "#F3F4F6"
}
```

**Validation:**
- `title`: Required, max 200 characters
- `content`: Max 50,000 characters

**Success Response (201):**
```json
{
  "success": true,
  "note": { ... }
}
```

---

### PUT /notes/:id

Update a note.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Note Title",
  "content": "Updated content...",
  "tags": ["updated-tag"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "note": { ... }
}
```

---

### PATCH /notes/:id/pin

Toggle note pin status.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "note": { ... }
}
```

---

### DELETE /notes/:id

Delete a note.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Note deleted successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

---

## Pomodoro

### GET /pomodoro/sessions

Get pomodoro session history.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of sessions to return (default: 50)
- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date
- `sessionType`: "work" | "short-break" | "long-break"

**Example:**
```
GET /api/pomodoro/sessions?limit=10&sessionType=work
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "sessions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "relatedTaskId": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Study for exam"
      },
      "relatedCourseCode": "CS101",
      "sessionType": "work",
      "duration": 25,
      "startTime": "2025-11-13T14:00:00.000Z",
      "endTime": "2025-11-13T14:25:00.000Z",
      "completed": true,
      "note": "Productive session",
      "createdAt": "2025-11-13T14:00:00.000Z"
    }
  ]
}
```

---

### POST /pomodoro/sessions

Create/log a pomodoro session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sessionType": "work",
  "duration": 25,
  "startTime": "2025-11-13T14:00:00.000Z",
  "endTime": "2025-11-13T14:25:00.000Z",
  "completed": true,
  "relatedTaskId": "507f1f77bcf86cd799439013",
  "relatedCourseCode": "CS101",
  "note": "Very focused session"
}
```

**Validation:**
- `sessionType`: Required, "work" | "short-break" | "long-break"
- `duration`: Required, 1-120 minutes
- `startTime`: Required, ISO 8601 date
- `endTime`: Required, ISO 8601 date
- `completed`: Boolean

**Success Response (201):**
```json
{
  "success": true,
  "session": { ... }
}
```

---

### PUT /pomodoro/sessions/:id

Update a pomodoro session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "completed": false,
  "note": "Session was interrupted"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "session": { ... }
}
```

---

### GET /pomodoro/statistics

Get pomodoro statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period`: "7d" | "30d" | "90d" (default: "7d")

**Example:**
```
GET /api/pomodoro/statistics?period=30d
```

**Success Response (200):**
```json
{
  "success": true,
  "period": "30d",
  "stats": {
    "total": 45,
    "completed": 40,
    "interrupted": 5,
    "totalMinutes": 1125,
    "byType": {
      "work": 30,
      "shortBreak": 10,
      "longBreak": 5
    },
    "averageDuration": 25
  }
}
```

---

### GET /pomodoro/settings

Get user's pomodoro settings.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "settings": {
    "workDuration": 25,
    "shortBreak": 5,
    "longBreak": 15,
    "sessionsBeforeLongBreak": 4
  }
}
```

---

### PUT /pomodoro/settings

Update pomodoro settings.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "workDuration": 30,
  "shortBreak": 10,
  "longBreak": 20,
  "sessionsBeforeLongBreak": 3
}
```

**Success Response (200):**
```json
{
  "success": true,
  "settings": { ... }
}
```

---

## Timetable

### GET /timetable

Get all timetables for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "timetables": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "semester": "Fall 2025",
      "isActive": true,
      "courses": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "courseCode": "CS101",
          "courseName": "Introduction to Programming",
          "instructor": "Dr. Smith",
          "schedule": [
            {
              "_id": "507f1f77bcf86cd799439014",
              "dayOfWeek": 1,
              "startTime": "09:00",
              "endTime": "10:30",
              "location": "Room 204",
              "type": "lecture"
            },
            {
              "_id": "507f1f77bcf86cd799439015",
              "dayOfWeek": 3,
              "startTime": "09:00",
              "endTime": "10:30",
              "location": "Room 204",
              "type": "lecture"
            }
          ],
          "color": "#3B82F6",
          "credits": 3
        }
      ],
      "createdAt": "2025-11-13T10:00:00.000Z",
      "updatedAt": "2025-11-13T10:00:00.000Z"
    }
  ]
}
```

---

### GET /timetable/active

Get the active timetable.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "timetable": { ... }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "No active timetable found"
}
```

---

### GET /timetable/:id

Get a single timetable by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "timetable": { ... }
}
```

---

### POST /timetable

Create a new timetable.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "semester": "Fall 2025",
  "isActive": true,
  "courses": [
    {
      "courseCode": "CS101",
      "courseName": "Introduction to Programming",
      "instructor": "Dr. Smith",
      "schedule": [
        {
          "dayOfWeek": 1,
          "startTime": "09:00",
          "endTime": "10:30",
          "location": "Room 204",
          "type": "lecture"
        }
      ],
      "color": "#3B82F6",
      "credits": 3
    }
  ]
}
```

**Validation:**
- `semester`: Required, max 50 characters
- `courses`: Array, each course must have `courseCode` and `courseName`
- `dayOfWeek`: 0-6 (0=Sunday, 6=Saturday)
- `startTime/endTime`: Format "HH:MM"

**Success Response (201):**
```json
{
  "success": true,
  "timetable": { ... }
}
```

---

### PUT /timetable/:id

Update a timetable.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "semester": "Spring 2026",
  "courses": [ ... ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "timetable": { ... }
}
```

---

### PATCH /timetable/:id/activate

Set a timetable as active (deactivates others).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "timetable": { ... }
}
```

---

### DELETE /timetable/:id

Delete a timetable.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Timetable deleted successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

---

## Chatbot

### POST /chatbot

Send a message to the AI assistant.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Add Algorithms lecture tomorrow 10:00-12:00 room B201"
}
```

**Success Responses:**

**Event Created:**
```json
{
  "ok": true,
  "action": "created",
  "event": { ... }
}
```

**Event Updated:**
```json
{
  "ok": true,
  "action": "updated",
  "event": { ... }
}
```

**Event Deleted:**
```json
{
  "ok": true,
  "action": "deleted",
  "id": "507f1f77bcf86cd799439011"
}
```

**Events List:**
```json
{
  "ok": true,
  "action": "list",
  "events": [ ... ]
}
```

**Task Created:**
```json
{
  "ok": true,
  "action": "task_created",
  "task": { ... }
}
```

**Task Updated:**
```json
{
  "ok": true,
  "action": "task_updated",
  "task": { ... }
}
```

**Task Deleted:**
```json
{
  "ok": true,
  "action": "task_deleted",
  "id": "507f1f77bcf86cd799439011"
}
```

**Tasks List:**
```json
{
  "ok": true,
  "action": "tasks_list",
  "tasks": [ ... ]
}
```

**Pomodoro Control:**
```json
{
  "ok": true,
  "action": "pomodoro",
  "message": "Starting a 25-minute focus session.",
  "command": {
    "action": "start",
    "durationSeconds": 1500
  }
}
```

**Help/Clarification:**
```json
{
  "ok": true,
  "help": "Need more details. What time should the event be?",
  "suggestions": [
    "Add event tomorrow at 2pm",
    "Show my schedule for next week"
  ]
}
```

**Example Messages:**
- "Add Algorithms lecture tomorrow 10:00-12:00 room B201"
- "Move calculus to Friday 5pm"
- "Delete physics lab"
- "Show my events next week"
- "Add task: Study for exam, due Friday"
- "Mark calculus homework as done"
- "Start a 25 minute Pomodoro"
- "What do I have tomorrow?"

---

## Error Responses

### Validation Errors (400)

```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### Authentication Errors (401)

```json
{
  "success": false,
  "error": "Invalid token"
}
```

```json
{
  "success": false,
  "error": "No auth header"
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Server Error"
}
```

In development mode, error responses include a `stack` field with the stack trace.

---

## Response Format

All successful responses follow this structure:

```json
{
  "success": true,
  // ... additional data
}
```

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Error message",
  // ... optional additional fields
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. This should be added for production deployment.

---

## CORS

The API accepts requests from the configured `CORS_ORIGIN` (default: `http://localhost:5173`).

---

## Date Format

All dates use ISO 8601 format:
```
2025-11-13T14:30:00.000Z
```

---

## Pagination

Currently, list endpoints return all results. Pagination should be implemented for large datasets.

**Recommended query parameters for future implementation:**
- `page`: Page number
- `limit`: Items per page
- `sort`: Sort field
- `order`: "asc" or "desc"

---

## Health Check

### GET /

Basic server status.

**Success Response (200):**
```json
{
  "success": true,
  "message": "SmartStudy API is running",
  "version": "1.0.0",
  "timestamp": "2025-11-13T10:00:00.000Z"
}
```

### GET /api/health

Detailed health check.

**Success Response (200):**
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 3600.123,
  "timestamp": "2025-11-13T10:00:00.000Z"
}
```

---

## Notes

1. **Authentication**: All endpoints except `/auth/signup` and `/auth/login` require JWT authentication
2. **User Isolation**: All resources are scoped to the authenticated user
3. **Timestamps**: All models include `createdAt` and `updatedAt` timestamps
4. **IDs**: MongoDB ObjectIds are used for all IDs
5. **Validation**: Request validation is handled by express-validator
6. **Error Handling**: Centralized error handling with consistent response format

---

## Support

For issues or questions about the API, check the server logs or contact the development team.
