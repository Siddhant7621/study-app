# 📘 Study Assistant– AI Learning Companion

> A full-stack web app designed to help school students revise their coursebooks using **AI-powered quizzes, chat, and progress tracking**.

---

## 🌐 Live Demo

- **Frontend:** [https://study-app-frontend-phi.vercel.app]
- **Backend:** [https://study-app-server-8j26.onrender.com/]

---

## 🧩 Overview

**Study Assistant** is an AI-powered web platform that empowers students to:
- Upload and view their textbooks 📚  
- Generate **AI-based quizzes** (MCQs, SAQs, LAQs) 🧠  
- Analyze performance and track progress 📈  
- Chat with an AI tutor for instant doubt-solving 💬  
- Watch topic-relevant **YouTube video recommendations** 🎥  

> ⚠️ *Note:* For best performance, use **small PDFs (<10MB)** — large files may not process fully due to free-tier AI model limits.

---

## 📋 Features Implemented

### ✅ Must-Have Features

#### 1️⃣ Source Selector & PDF Management
- Upload personal PDF coursebooks.
- Browse PDFs uploaded by other users.
- Cloudinary integration for fast, global file storage.
- File validation for PDF format and size.

#### 2️⃣ PDF Viewer
- Integrated PDF viewer with smooth navigation.
- Display selected books alongside chat view.
- Option to mark completion and track progress.

#### 3️⃣ AI Quiz Generator Engine
- AI generates **MCQs**, **SAQs**, and **LAQs** from the uploaded book.
- Auto-evaluation with **instant scoring**.
- Detailed **explanations for every answer**.
- Performance analysis (strengths/weaknesses).
- Regenerate quiz anytime for revision.

#### 4️⃣ Progress Tracking
- Dynamic **dashboard** showing:
  - Quizzes taken
  - Correct vs incorrect answers
  - Books uploaded & completed
- Visual learning insights powered by AI.

---

### ✨ Nice-to-Have Features

#### 💬 AI Chat Companion
- ChatGPT-style interface for asking topic-related doubts.
- Responsive design with real-time AI answers.
- Clean chat layout and chat history.

#### 🎥 YouTube Recommender
- Suggests educational videos related to the selected book.
- Embedded player for in-app viewing.

---

## 🧱 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React (Vite), Tailwind CSS, Axios, React Router |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB Atlas |
| **Storage** | Cloudinary |
| **AI Integration** | Perplexity API (for quiz, analysis, chat) |
| **Video API** | YouTube Data API |
| **Auth** | JWT (JSON Web Token) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🗂️ Project Structure

<details>
<summary>📁 Click to expand</summary>

studymate/
├── backend/
│ ├── models/
│ │ ├── User.js
│ │ ├── Book.js
│ │ ├── Quiz.js
│ │ └── Progress.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── books.js
│ │ ├── quiz.js
| | ├── upload.js
| | ├── youtube.js
│ │ ├── chat.js
│ │ └── progress.js
│ ├── middleware/
│ │ └── auth.js
├── config/
│ │ └── cloudinary.js
│ ├── services/
│ │ ├── aiService.js
│ │ ├── quizService.js
| | ├── chatService.js
| | ├── pdfService.js
| | ├── quizService.js
│ ├── server.js
│ └── .env.example
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── UploadBook.jsx
| | | ├── BookChat.jsx
| | | ├── Login.jsx
│ │ │ ├── PDFViewer.jsx
| | | ├── SimplePDFViewer.jsx
│ │ │ ├── QuizComponent.jsx
│ │ │ ├── ChatInterface.jsx
│ │ │ ├── VideoRecommendations.jsx
│ │ │ └── ProgressDashboard.jsx
│ │ └── App.jsx
| | └── main.jsx
└── README.md



</details>

---

## 🚀 Getting Started

### 📦 Prerequisites

Make sure you have:
- Node.js (v16+)
- MongoDB Atlas account
- Cloudinary account
- Perplexity API key
- YouTube Data API key

---

### ⚙️ Environment Setup

> ✅ Use the provided **`.env.example`** file in `/backend` to create your `.env`.

Example:
```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

PERPLEXITY_API_KEY=your_perplexity_api_key
YOUTUBE_API_KEY=your_youtube_api_key

PORT=5001
NODE_ENV=development

🧑‍💻 Installation & Running

1️⃣ Clone the repository
git clone https://github.com/Siddhant7621/studymate.git
cd studymate


2️⃣ Backend Setup
cd backend
npm install
npm run dev
Backend runs on: http://localhost:5001

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
Frontend runs on: http://localhost:3000





🧠 How I Built the Project
🏗️ Development Stages
Foundation: Set up MERN boilerplate with authentication (JWT).

PDF Upload & View: Integrated Cloudinary for secure file handling.

AI Integration: Added Perplexity API for quiz generation and chat.

Progress Dashboard: Built a user progress and analysis system.

Polish: Added responsive UI, validation, and deployment setup.

⚙️ Key Technical Choices
Cloudinary for scalable and CDN-backed file storage.

MongoDB Atlas for high availability and flexible schema design.

Perplexity API for cost-efficient and flexible AI operations.

Tailwind CSS for rapid, consistent, and responsive UI.

Vercel + Render for seamless full-stack deployment.


🤖 LLM Tools Usage
Purpose	Tool Used	Description
Quiz Generation	Perplexity API	AI model parses PDF content and generates MCQs, SAQs, LAQs.
Chat Assistant	Perplexity API	AI chatbot for topic-related Q&A and clarifications.
Performance Analysis	Perplexity API	AI evaluates answers and highlights strengths & weaknesses.
Development	ChatGPT, Deepseek Assisted in debugging, refactoring, and documentation writing.

📊 Tradeoffs & Decisions
Challenge	Decision Made	Reason
Large PDF Handling	Limited to <10MB	Free-tier AI can’t process huge datasets efficiently.
RAG Implementation	Deferred	Focused on building core quiz and chat functionality.
Caching / Redis	Not implemented	MVP prioritization for simplicity and clarity.
Complex Analytics	Simplified	Due to limited time window (assignment deadline).

✅ What’s Working Perfectly
🔐 User Authentication (Signup/Login)

📂 PDF Upload (Cloudinary)

🧾 PDF Viewer

🧠 Quiz Generator (MCQ, SAQ, LAQ)

📝 AI-based explanations & scoring

📊 Progress Dashboard

💬 AI Chatbot

🎥 YouTube Video Recommendations

📱 Responsive UI across devices

☁️ Deployed successfully on Vercel + Render



🔮 Future Scope
🧩 RAG Chatbot with document citation & context memory

💾 Persistent chat sessions

📊 More detailed per-book progress tracking

⚡ Redis caching for faster responses

🕹️ Gamified learning (badges, streaks, leaderboard)

👨‍🏫 Teacher & parent dashboards

📱 Mobile app (React Native)

🧠 Learnings & Reflection
This project challenged me to:

Integrate AI models into full-stack applications.

Handle file uploads and cloud storage effectively.

Architect scalable MERN applications with real-world use cases.

Optimize workflows using LLM-assisted coding tools.

👨‍💻 Developer
Siddhant Sharma
Full Stack Developer | Passionate about AI and EdTech 🚀
📧 siddhant7621@gmail.com
🔗 https://www.linkedin.com/in/siddhantsharma7621/ 
🔗 https://github.com/Siddhant7621

📄 License
All code and design are the intellectual property of Siddhant Sharma.
