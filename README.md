# ClassReconnect - Student Learning Management System

A modern, full-stack web application for students to access course materials, take quizzes, and get AI-powered answers to their questions.

## 🏗️ Project Structure

# ClassReconnect - Advanced Student Learning Management System

A comprehensive, full-stack educational platform built with Node.js, Express, MongoDB, and vanilla JavaScript. ClassReconnect enables students and teachers to access course materials, participate in AI-powered Q&A sessions, create and manage quizzes, and track academic progress.

**Author:** Karan Vora | **License:** MIT

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [Installation & Setup](#installation--setup)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Environment Configuration](#environment-configuration)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

ClassReconnect is an advanced Learning Management System (LMS) designed for educational institutions. It facilitates:

- **Student Learning**: Access course materials, resources, and quizzes organized by subject and semester
- **Interactive Q&A**: AI-powered conversational assistance for academic questions using Grok/OpenAI APIs
- **Assessment**: Teachers create, manage, and grade quizzes with auto-scoring
- **Progress Tracking**: Monitor student performance and learning patterns
- **Role-Based Access**: Separate dashboards and functionalities for students and teachers
- **Audit Trail**: Complete logging of user activities, profile changes, and resource operations

---

## 🏗️ Project Structure

```
Mini Project/
│
├── frontend/                              # Frontend Application (Static HTML/CSS/JS)
│   ├── public/                            # Static files served by backend
│   │   ├── landing.html                  # Landing page (homepage)
│   │   ├── index.html                    # Main dashboard
│   │   ├── login.html                    # Login page
│   │   ├── signup.html                   # Registration page
│   │   ├── student-login.html            # Student-specific login
│   │   ├── student-signup.html           # Student-specific signup
│   │   ├── teacher-login.html            # Teacher-specific login
│   │   ├── teacher-signup.html           # Teacher-specific signup
│   │   ├── qa.html                       # Q&A interface
│   │   ├── course.html                   # Course listing page
│   │   ├── solution.html                 # Solution page
│   │   ├── resources/                    # Course materials and resources
│   │   │   ├── courses/                  # Course images/metadata
│   │   │   ├── DBMS/                     # Database Management System
│   │   │   ├── DLCOA/                    # Digital Logic & Computer Organization
│   │   │   ├── DS/                       # Data Structures
│   │   │   ├── DSGT/                     # Discrete Structures & Graph Theory
│   │   │   ├── Maths/                    # Mathematics
│   │   │   └── project_resource/         # Project-specific resources
│   │   ├── Quiz Test/                    # Quiz test files
│   │   │   ├── DBMS/, DLCOA/, DS/, DSGT/, Maths/
│   │   │   └── Solution/
│   │   ├── assets/                       # Static assets
│   │   │   ├── css/                      # Stylesheets
│   │   │   ├── js/                       # JavaScript utilities
│   │   │   └── images/                   # Images and icons
│   │   ├── aiBot.py                      # Python AI bot utility
│   │   └── debug-*.html                  # Debug and testing pages
│   └── package.json                      # Frontend dependencies
│
├── backend/                               # Backend API Server (Node.js/Express)
│   ├── src/
│   │   ├── server.js                     # Main Express.js server & API routes
│   │   ├── config/
│   │   │   ├── config.js                 # Environment configuration
│   │   │   └── database.js               # MongoDB connection setup
│   │   ├── controllers/
│   │   │   └── qaController.js           # Q&A answer generation logic
│   │   ├── models/                       # MongoDB Schemas
│   │   │   ├── User.js                   # User model (students & teachers)
│   │   │   ├── Conversation.js           # Q&A conversation history
│   │   │   ├── Resource.js               # Course resources
│   │   │   ├── QuizCreated.js            # Quiz definitions
│   │   │   ├── QuizResult.js             # Quiz submission results
│   │   │   ├── LoginActivity.js          # User login/logout tracking
│   │   │   ├── Note.js                   # User notes
│   │   │   ├── ProfileChangeLog.js       # Profile modification history
│   │   │   ├── ResourceAddedLog.js       # Resource addition logs
│   │   │   ├── ResourceDeletedLog.js     # Resource deletion logs
│   │   │   └── DeletedDefault.js         # Soft-delete tracking
│   │   ├── routes/
│   │   │   ├── qaRoutes.js               # Q&A endpoints
│   │   │   ├── resources.js              # Resource management endpoints
│   │   │   ├── quizzes.js                # Quiz management endpoints
│   │   │   └── conversations.js          # Conversation management endpoints
│   │   ├── middleware/
│   │   │   └── auth.js                   # JWT authentication middleware
│   │   ├── lib/
│   │   │   └── qaConversationStore.js    # Conversation storage utilities
│   │   └── data/
│   │       ├── sampleResources.js        # Pre-seeded sample resources
│   │       ├── db.json                   # JSON fallback database
│   │       └── qa_conversations.json     # Q&A conversation history (backup)
│   ├── uploads/                          # User-uploaded files directory
│   ├── package.json                      # Backend dependencies
│   ├── .env                              # Environment variables (not in repo)
│   ├── add-sample-resources.js           # Script to seed sample data
│   ├── test-google-sr.js                 # Google search API testing
│   └── README.md                         # Backend-specific documentation
│
├── chat-gpt/                             # Next.js AI Assistant Application
│   ├── my-app/                           # Next.js app
│   │   ├── app/
│   │   │   ├── page.tsx                  # Main page component
│   │   │   ├── assistant.tsx             # AI assistant UI component
│   │   │   ├── layout.tsx                # App layout
│   │   │   ├── api/chat/                 # AI chat endpoint
│   │   │   └── globals.css               # Global styles
│   │   ├── components/
│   │   │   ├── assistant-ui/             # Assistant UI components
│   │   │   ├── ui/                       # Reusable UI components
│   │   ├── hooks/use-mobile.ts           # Mobile detection hook
│   │   ├── lib/utils.ts                  # Utility functions
│   │   ├── package.json                  # Next.js dependencies
│   │   ├── tsconfig.json                 # TypeScript configuration
│   │   ├── next.config.ts                # Next.js configuration
│   │   └── README.md                     # Next.js app documentation
│   └── predefined_questions/
│       └── questions.txt                 # Pre-defined Q&A questions
│
├── .github/chatmodes/
│   └── new.chatmode.md                   # GitHub chat mode configuration
│
├── .vscode/
│   └── launch.json                       # VS Code debugging configuration
│
├── test-api.js                           # API endpoint testing script
├── test-resources.js                     # Resource API testing script
├── new.html                              # Legacy HTML file
├── package.json                          # Root package.json
└── README.md                             # This file
```

---

## 🚀 Key Features

### 👥 **User Management**
- **Dual Role System**: Separate workflows for students and teachers
- **Student Profile**: Branch, semester, and subject tracking
- **Teacher Profile**: Department, subject expertise, and experience level
- **Login Activity Tracking**: Monitor user access patterns
- **Profile Change History**: Audit trail for profile modifications

### 📚 **Course Management**
- **Multi-Subject Support**: DBMS, DLCOA, DS, DSGT, Mathematics, and more
- **Branch-Based Organization**: COMPS, IT, AIDS, EXTC
- **Semester-Based Curriculum**: 8-semester structure
- **Resource Upload**: Teachers can upload and manage course materials
- **Resource Versioning**: Track resource additions and deletions

### 🤖 **AI-Powered Q&A**
- **Intelligent Assistance**: Grok and OpenAI model support
- **Conversation History**: Persistent storage of Q&A sessions
- **Context-Aware Responses**: AI responses grounded in course materials
- **Predefined Questions**: Ready-made questions for quick learning
- **Model Fallback**: Automatic switching between Grok and OpenAI

### 📋 **Quiz System**
- **Quiz Creation**: Teachers create quizzes with customizable parameters
  - Duration, number of questions, subject, branch, semester
  - Support for existing exam papers
  - Multiple questions with various options
- **Quiz Taking**: Students complete quizzes with time tracking
- **Auto-Grading**: Automatic scoring of quiz responses
- **Performance Analytics**: Quiz result tracking and analysis
- **Quiz Visibility Control**: Teacher-controlled access to quizzes

### 💬 **Conversation Management**
- **Chat History**: Persistent storage of all Q&A conversations
- **User-Specific Conversations**: Isolated conversations per user
- **Conversation Titles**: Customizable conversation naming
- **Message Tracking**: User and AI message differentiation
- **Timestamps**: Full audit trail with creation and update timestamps

### 🔐 **Security**
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt encryption for password storage
- **Role-Based Access Control**: Endpoint authorization by role
- **Email Uniqueness**: Prevents duplicate account creation
- **CORS Protection**: Cross-origin resource sharing enabled

### 📊 **Logging & Auditing**
- **Login Activity Logs**: When users log in/out
- **Profile Change Logs**: Track profile modifications
- **Resource Operation Logs**: Log resource additions and deletions
- **Soft Deletion**: Mark resources as deleted without removal

---

## 🛠️ Technology Stack

### **Frontend**
- **HTML5**: Semantic markup
- **CSS3**: Responsive design with Tailwind CSS support
- **JavaScript (Vanilla)**: DOM manipulation and API calls
- **HTTP Server**: Served via Express.js backend

### **Backend**
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js 4.19.2
- **Database**: MongoDB 8.19.1 (primary) + JSON files (fallback)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Security**: bcryptjs 3.0.2
- **File Upload**: Multer 1.4.5-lts.1
- **CORS**: Cross-Origin Resource Sharing enabled

### **AI Integration**
- **Grok API**: X.AI's Grok language model (primary)
- **OpenAI Support**: ChatGPT models as fallback

### **Utilities**
- **File Handling**: fs module for JSON storage
- **ID Generation**: nanoid 5.0.7
- **Environment**: dotenv 16.4.5
- **Web Scraping**: Cheerio 1.1.2, Puppeteer 24.29.1
- **Search**: google-sr 6.0.0, google-it 1.6.4

### **Next.js Assistant (Optional)**
- **Framework**: Next.js 15.5.4
- **UI Framework**: React 19.2.0
- **AI SDK**: @ai-sdk/openai 2.0.46
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI, Lucide React
- **Animation**: Framer Motion

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js v14 or higher
- npm or yarn package manager
- MongoDB instance (local or cloud - Atlas recommended)
- Grok/OpenAI API key

### **1. Clone or Extract Project**
```bash
cd "c:\Users\Karan Vora\Desktop\New folder\Mini Project"
```

### **2. Backend Setup**

Navigate to backend directory:
```powershell
cd backend
npm install
```

Create `.env` file in `backend/` directory:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/classreconnect
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classreconnect

# AI Configuration - Grok API (Recommended)
GROK_API_KEY=your_grok_api_key_here
GROK_MODEL=grok-2

# AI Configuration - OpenAI (Alternative)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Authentication
JWT_SECRET=your_jwt_secret_key_here_min_32_chars

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Get API Keys:**
- **Grok API**: https://x.ai/api (requires X account)
- **OpenAI API**: https://platform.openai.com/api-keys
- **MongoDB**: https://www.mongodb.com/cloud/atlas (free tier available)

Start backend server:
```powershell
npm start
# or for development:
npm run dev
```

Server will run on `http://localhost:3000`

### **3. Frontend Setup**

The frontend is automatically served by the backend Express server. To run independently:

```powershell
cd frontend
npm install
npm start
# Frontend runs on http://localhost:8080
```

### **4. (Optional) Next.js AI Assistant Setup**

```powershell
cd chat-gpt/my-app
npm install
npm run dev
# Runs on http://localhost:3001
```

### **5. Access the Application**

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Main application |
| `http://localhost:3000/landing.html` | Landing page |
| `http://localhost:3000/student-login.html` | Student login |
| `http://localhost:3000/teacher-login.html` | Teacher login |
| `http://localhost:3000/qa.html` | Q&A interface |
| `http://localhost:3000/course.html` | Course listing |
| `http://localhost:3001` | Next.js AI Assistant (optional) |

---

## 📡 API Documentation

### **Base URL**
```
http://localhost:3000/api
```

### **Authentication Endpoints**

#### Register Student
```http
POST /auth/register/student
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "branch": "COMPS",
  "semester": "Semester 3"
}

Response: { token: "jwt_token", user: {...} }
```

#### Register Teacher
```http
POST /auth/register/teacher
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "department": "Computer Science",
  "subject": "Data Structures",
  "employeeId": "EMP001",
  "yearsExperience": "6-10 years",
  "hobby": "Teaching"
}

Response: { token: "jwt_token", user: {...} }
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token: "jwt_token", user: {...} }
```

### **Q&A Endpoints**

#### Get AI Answer
```http
POST /qa/answer
Content-Type: application/json
Authorization: Bearer {token}

{
  "question": "What is a database index?"
}

Response: {
  "success": true,
  "source": "grok",
  "answer": "A database index is..."
}
```

### **Conversation Endpoints**

#### Get User Conversations
```http
GET /conversations?userId={userId}
Authorization: Bearer {token}

Response: [{ id, title, messages: [...], createdAt, updatedAt }, ...]
```

#### Create Conversation
```http
POST /conversations
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "user_id",
  "title": "Data Structures Q&A",
  "messages": [
    { "role": "user", "content": "What is a linked list?" }
  ]
}

Response: { id, title, messages, createdAt }
```

#### Update Conversation
```http
PUT /conversations/{conversationId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "messages": [...]
}

Response: { success: true, conversation: {...} }
```

#### Delete Conversation
```http
DELETE /conversations/{conversationId}?userId={userId}
Authorization: Bearer {token}

Response: { success: true }
```

### **Resource Endpoints**

#### Get Resources
```http
GET /resources?subject=DBMS&branch=COMPS&semester=Semester3
Response: [ { id, title, subject, description, fileUrl }, ...]
```

#### Upload Resource (Teacher only)
```http
POST /resources/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- file: <binary file>
- title: "Data Structures Notes"
- subject: "DS"
- description: "Chapter 1-5"

Response: { success: true, resource: {...} }
```

#### Delete Resource (Teacher only)
```http
DELETE /resources/{resourceId}
Authorization: Bearer {token}

Response: { success: true }
```

### **Quiz Endpoints**

#### Create Quiz (Teacher only)
```http
POST /quizzes
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "DS Quiz 1",
  "duration": 60,
  "branch": "COMPS",
  "semester": "Semester 3",
  "subject": "Data Structures",
  "numQuestions": 10,
  "questions": [
    { "question": "What is...", "options": [...], "correctAnswer": 0 }
  ]
}

Response: { message: "Quiz created", quiz: {...} }
```

#### Get Quizzes
```http
GET /quizzes?subject=DS&branch=COMPS
Response: [ { id, name, duration, questions: [...] }, ... ]
```

#### Submit Quiz (Student)
```http
POST /quizzes/{quizId}/submit
Content-Type: application/json
Authorization: Bearer {token}

{
  "answers": [0, 1, 2, 1, 0, ...]
}

Response: { score: 85, totalQuestions: 10, results: [...] }
```

---

## 🗄️ Database Schema

### **User Model**
```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (enum: ['student', 'teacher']),
  
  // Student fields
  branch: String (enum: ['COMPS', 'IT', 'AIDS', 'EXTC']),
  semester: String (enum: ['Semester 1'-'Semester 8']),
  
  // Teacher fields
  department: String,
  subject: String,
  employeeId: String (unique for teachers),
  yearsExperience: String,
  hobby: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### **Conversation Model**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  userName: String,
  role: String (student/teacher),
  title: String,
  messages: [
    {
      role: String (user/ai),
      content: String,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### **Resource Model**
```javascript
{
  _id: ObjectId,
  title: String (required),
  subject: String,
  branch: String,
  semester: String,
  description: String,
  fileUrl: String,
  uploadedBy: ObjectId (ref: User),
  fileSize: Number,
  mimeType: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Quiz Models**
```javascript
// QuizCreated
{
  _id: ObjectId,
  name: String,
  duration: Number (minutes),
  branch: String,
  semester: String,
  subject: String,
  numQuestions: Number,
  questions: [{ question, options, correctAnswer, points }],
  createdBy: ObjectId (ref: User),
  createdAt: Date
}

// QuizResult
{
  _id: ObjectId,
  quizId: ObjectId (ref: QuizCreated),
  userId: ObjectId (ref: User),
  answers: [answer choices],
  score: Number,
  totalQuestions: Number,
  duration: Number (seconds taken),
  submittedAt: Date
}
```

---

## ⚙️ Environment Configuration

### **Required Environment Variables**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/classreconnect

# AI Services (choose one or both for fallback)
GROK_API_KEY=sk-...
GROK_MODEL=grok-2
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo

# Authentication
JWT_SECRET=your_very_secret_key_here_minimum_32_characters

# Server
PORT=3000
NODE_ENV=development
```

### **Optional Environment Variables**

```env
# Force AI-only mode (disable local fallback)
QA_REQUIRE_AI=true

# Database selection
USE_JSON_DB=false  # Set true to use JSON fallback

# Search APIs (for resource discovery)
GOOGLE_SR_API_KEY=...
```

---

## 🚢 Deployment Guide

### **Deployment Checklist**

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Configure production MongoDB URI
- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Configure `PORT` (typically 80 or 443)
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up domain name
- [ ] Configure CORS for production domain
- [ ] Test all API endpoints
- [ ] Set up database backups
- [ ] Enable error logging

### **Hosting Options**

1. **Heroku**
   ```bash
   heroku login
   heroku create your-app-name
   heroku config:set OPENAI_API_KEY=sk-...
   git push heroku main
   ```

2. **Vercel** (for Next.js assistant)
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Docker** (Recommended)
   ```dockerfile
   FROM node:18
   WORKDIR /app
   COPY backend ./
   RUN npm install --production
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

4. **AWS, DigitalOcean, Render** (VPS options)
   - SSH into server
   - Install Node.js and MongoDB
   - Clone repository
   - Configure environment variables
   - Start with PM2 or systemd

---

## 🐛 Troubleshooting

### **Common Issues**

| Issue | Solution |
|-------|----------|
| `MongoDB connection failed` | Verify MONGODB_URI, ensure MongoDB service is running, check network access |
| `GROK_API_KEY not found` | Create `.env` file in backend/, set correct API key |
| `Port 3000 already in use` | Change PORT in `.env` or kill process: `netstat -ano \| findstr :3000` |
| `CORS errors` | Check CORS configuration in server.js, ensure frontend URL is whitelisted |
| `JWT token invalid` | Re-login, ensure JWT_SECRET is consistent, check token expiration |
| `File upload fails` | Ensure `uploads/` directory exists and is writable, check file size limits |
| `Quiz not visible` | Verify role (must be teacher to create), check quiz filters |

### **Debug Mode**

Enable detailed logging:
```powershell
$env:DEBUG=* ; npm start
```

### **Reset Application**

Clear all data and restart:
```powershell
# Delete database
Remove-Item -Path "backend/data/db.json" -Force

# Reinstall dependencies
cd backend
Remove-Item -Recurse -Path "node_modules" -Force
npm install

# Restart
npm start
```

---

## 📝 Sample Workflows

### **Student Workflow**
1. Sign up with branch and semester
2. Login to dashboard
3. Browse course materials by subject
4. Ask AI questions in Q&A section
5. Take quizzes assigned by teachers
6. View quiz results and feedback

### **Teacher Workflow**
1. Sign up with department and subject
2. Login to teacher dashboard
3. Upload course resources (PDFs, notes)
4. Create quizzes for specific branches/semesters
5. View student quiz submissions
6. Track student performance
7. Manage course materials

---

## 📚 Learning Resources

### **Courses Included**
- **DBMS** (Database Management System)
- **DLCOA** (Digital Logic & Computer Organization)
- **DS** (Data Structures)
- **DSGT** (Discrete Structures & Graph Theory)
- **Maths** (Mathematics)

### **Branches Supported**
- COMPS (Computer Science)
- IT (Information Technology)
- AIDS (Artificial Intelligence & Data Science)
- EXTC (Electronics & Telecommunication)

---

## 🔗 Quick Links

- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Grok API**: https://x.ai/api
- **OpenAI API**: https://platform.openai.com/api-keys
- **Express.js Docs**: https://expressjs.com
- **Mongoose Docs**: https://mongoosejs.com
- **JWT Info**: https://jwt.io

---

## 📞 Support & Contributions

For issues, feature requests, or contributions:
- Check existing documentation
- Review API endpoints
- Test with provided scripts (`test-api.js`, `test-resources.js`)
- Contact project maintainer

---

## 👨‍💻 Author & License

**Karan Vora** - Computer Science Student

**License**: MIT License - Feel free to use this project for educational purposes.

---

*Built with ❤️ for students by students*

## 🚀 Features

### Frontend Features
- **Modern Dashboard**: Clean, responsive UI built with Tailwind CSS
- **Resource Library**: Browse and filter course materials by subject, semester, branch
- **Q&A Assistant**: AI-powered chat interface using ChatGPT API
- **Quiz System**: Generate quizzes from course materials
- **User Authentication**: Login/signup with local storage
- **Profile Management**: Update user information and preferences

### Backend Features
- **RESTful API**: Express.js server with proper API endpoints
- **ChatGPT Integration**: OpenAI API integration for intelligent Q&A
- **Conversation Management**: Store and retrieve chat history
- **Static File Serving**: Serve frontend files and course materials
- **CORS Support**: Cross-origin resource sharing enabled

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- OpenAI API key

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Server Configuration
PORT=3000
```

Start the backend server:
```bash
npm start
```

### 2. Frontend Setup

The frontend is served by the backend server, so no separate setup is needed. However, if you want to run it independently:

```bash
cd frontend
npm install
npm start  # Runs on http://localhost:8080
```

### 3. Access the Application

- **Main Application**: http://localhost:3000
- **Login Page**: http://localhost:3000/login.html
- **Signup Page**: http://localhost:3000/signup.html

## 📚 Course Materials

The application includes comprehensive course materials for:

- **DBMS** (Database Management System)
- **DLCOA** (Digital Logic & Computer Organization & Architecture)
- **Data Structures** (DS)
- **DSGT** (Discrete Structures & Graph Theory)
- **Mathematics** (Maths)

All materials are organized by semester and branch (COMPS, IT, AIDS, EXTC).

## 🤖 AI Integration

The Q&A feature uses OpenAI's ChatGPT API to provide intelligent answers to student questions. Features include:

- **Conversation History**: Maintains context across multiple questions
- **Multiple Conversations**: Users can create separate conversation threads
- **Local Storage Backup**: Conversations are cached locally for offline access
- **Error Handling**: Graceful fallback when API is unavailable

## 🔧 API Endpoints

### Authentication & Users
- `GET /api/health` - Health check
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations?userId=` - Get user conversations
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### AI Q&A
- `POST /api/qa` - Send question to ChatGPT API
	- Supports optional `contextFilters` in the request body (subject, semester, branch). When provided the server will include short summaries of matching library notes as system context so the assistant can reference local resources in its answers.
	- Environment variables: `OPENAI_API_KEY` (required) and optional `OPENAI_MODEL` (default: `gpt-4o-mini`).

## 🎨 Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: No frameworks, pure JS
- **Local Storage**: Client-side data persistence

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **OpenAI API**: ChatGPT integration
- **JSON File Storage**: Simple database solution

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features

- **Input Validation**: All user inputs are validated
- **CORS Protection**: Cross-origin requests are properly handled
- **API Key Protection**: OpenAI API key is stored securely in environment variables

## 🚀 Deployment

### Development
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend (optional)
cd frontend
npm start
```

### Production
The application can be deployed to any Node.js hosting platform:
- Heroku
- Vercel
- Railway
- DigitalOcean

## 📝 License

MIT License - Feel free to use this project for educational purposes.

## 👨‍💻 Author

**Karan Vora** - Computer Science Student

---

*Built with ❤️ for students by students*
