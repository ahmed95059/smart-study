# SmartStudy (MERN + Groq)
A full-stack student productivity and scheduling platform built with the MERN stack (MongoDB, Express, React, Node.js) and Groq AI integration for intelligent assistance.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-8-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Environment Variables](#environment-variables)
  - [Running with Docker](#option-1-running-with-docker-recommended)
  - [Running Locally](#option-2-running-locally)
- [API Documentation](#-api-documentation)
- [Usage](#-usage)

---

## ✨ Features

### 📅 Smart Calendar
- Create, edit, and delete events
- Support for lectures, exams, assignments, and general events
- CSV import for bulk event creation
- Day/week/month views with color-coded event types

### ✅ Task Management (To-Do Lists)
- Create and manage tasks with categories (Study, Assignment, Personal)
- Mark tasks as complete/incomplete
- Filter tasks by category
- Auto-categorization based on task title

### ⏱️ Pomodoro Timer
- Built-in 25-minute focus sessions
- Session tracking and statistics
- Customizable timer settings
- Local storage persistence for stats

### 📝 Quick Notes
- Create and edit notes instantly
- Timestamp tracking for notes
- Simple and intuitive interface

### 🤖 AI Assistant (Groq-powered)
- Natural language commands for scheduling
- Create events/tasks via chat
- Smart scheduling suggestions
- Study plan generation
- Pomodoro control via voice commands

### 🎨 Themes & Customization
- Light/Dark mode toggle
- Responsive design for all devices
- Modern UI with Tailwind CSS

### 🔐 Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes and API endpoints

---

## 🛠️ Tech Stack

### Frontend (Client)
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **react-big-calendar** - Calendar component
- **Lucide React** - Icon library
- **PapaParse** - CSV parsing

### Backend (Server)
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Groq SDK** - AI/LLM integration
- **Zod** - Schema validation
- **Morgan** - HTTP logging

---

## 📁 Project Structure

```
smartstudy/
├── docker-compose.yml       # Docker orchestration
├── README.md
├── client/                  # Frontend React app
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx          # Main app with routes
│       ├── main.jsx         # Entry point
│       ├── styles.css       # Global styles
│       ├── api/             # API service functions
│       │   ├── auth.js
│       │   ├── axios.js
│       │   ├── chat.js
│       │   ├── events.js
│       │   ├── notes.js
│       │   └── tasks.js
│       ├── components/      # Reusable components
│       │   ├── CalendarView.jsx
│       │   ├── Chatbot.jsx
│       │   ├── Notes.jsx
│       │   ├── Pomodoro.jsx
│       │   ├── Todo.jsx
│       │   └── ...
│       ├── context/         # React contexts
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       └── pages/           # Page components
│           ├── Dashboard.jsx
│           ├── Home.jsx
│           ├── Login.jsx
│           └── Signup.jsx
└── server/                  # Backend Express app
    ├── Dockerfile
    ├── package.json
    ├── API_DOCUMENTATION.md
    └── src/
        ├── index.js         # Server entry point
        ├── config/
        │   ├── db.js        # MongoDB connection
        │   └── env.js       # Environment config
        ├── llm/
        │   ├── groq.js      # Groq AI client
        │   └── intentSchema.js
        ├── middleware/
        │   ├── auth.js      # JWT authentication
        │   ├── errorHandler.js
        │   └── validators.js
        ├── models/          # Mongoose schemas
        │   ├── Event.js
        │   ├── Note.js
        │   ├── PomodoroSession.js
        │   ├── Task.js
        │   ├── Timetable.js
        │   └── User.js
        └── routes/          # API routes
            ├── auth.js
            ├── chatbot.js
            ├── events.js
            ├── notes.js
            ├── pomodoro.js
            ├── tasks.js
            └── timetable.js
```

---

## 📦 Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** or **yarn**
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **Docker** and **Docker Compose** (optional, for containerized deployment)
- **Groq API Key** (optional, for AI assistant features)

---

## 🚀 Getting Started

### Environment Variables

Create a `.env` file in the `server/` directory (or root for Docker):

```env
# Required
MONGODB_URI=mongodb://localhost:27017/smartstudy
JWT_SECRET=your-super-secret-jwt-key

# Optional (but recommended)
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
JWT_EXPIRE=30d
```

For the client, create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
```

---

### Option 1: Running with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartstudy
   ```

2. **Create environment file** in the root directory:
   ```bash
   # Create .env file with your configuration
   cp .env.example .env  # or create manually
   ```

3. **Start the containers**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

5. **Stop the containers**
   ```bash
   docker-compose down
   ```

---

### Option 2: Running Locally

#### Backend (Server)

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** with required variables (see above)

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

   Server runs at: http://localhost:5000

#### Frontend (Client)

1. **Navigate to client directory** (in a new terminal)
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Client runs at: http://localhost:5173

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📚 API Documentation

Full API documentation is available in [server/API_DOCUMENTATION.md](server/API_DOCUMENTATION.md).

### Quick API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |
| `/api/events` | GET/POST | List/Create events |
| `/api/events/:id` | GET/PUT/DELETE | Event CRUD |
| `/api/tasks` | GET/POST | List/Create tasks |
| `/api/tasks/:id` | GET/PUT/DELETE | Task CRUD |
| `/api/notes` | GET/POST | List/Create notes |
| `/api/notes/:id` | GET/PUT/DELETE | Note CRUD |
| `/api/chatbot` | POST | AI assistant chat |
| `/api/pomodoro/sessions` | GET/POST | Pomodoro sessions |
| `/api/timetable/active` | GET | Get active timetable |

**Authentication**: All endpoints except `/api/auth/signup` and `/api/auth/login` require a JWT token:
```
Authorization: Bearer <your_jwt_token>
```

---

## 💡 Usage

### Creating an Account
1. Navigate to http://localhost:5173
2. Click "Create Account" or go to `/signup`
3. Fill in your name, email, and password
4. You'll be redirected to the dashboard

### Dashboard Features
- **Calendar**: View and manage your schedule
- **Tasks**: Add, complete, and filter your to-do items
- **Notes**: Quick note-taking
- **Pomodoro**: Start focus sessions
- **AI Assistant**: Chat with the AI for scheduling help

### AI Assistant Examples
- "Add Algorithms lecture tomorrow 10:00-12:00 room B201"
- "I'm learning React and I'm a beginner, arrange my week"
- "Start a 25 minute Pomodoro session"
- "Show my open tasks for this week"

### CSV Import
You can import events via CSV with columns: `title`, `start`, `end`, `type`, `courseCode`, `location`, `notes`

---

## � Authors

This project is the collaborative work of:

- **Ahmed Baya Chatti**
- **Leith Gritli**
- **Rayen Ben Romdhane**

---

## �📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request