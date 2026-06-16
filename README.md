# 🎓 LearnSphere AI

> Your AI-powered study companion for smarter learning.

LearnSphere AI helps students transform lengthy PDFs into interactive learning experiences. Upload study material, chat with your documents, generate concise summaries, and create quizzes instantly — all from one platform.

---

## 🚀 Live Demo

🔗 https://learn-sphere-ai-lime.vercel.app/

---

## ✨ Features

### 📄 PDF Upload & Analysis
- Upload text-based PDF documents
- Extract content instantly
- Process lecture notes, research papers, SOPs, and study materials

### 🤖 AI Chat with PDFs
- Ask questions directly about uploaded documents
- Context-aware answers powered by AI
- Get instant explanations from your study material

### 📝 Smart Summaries
- Generate concise summaries automatically
- Extract key concepts and important points
- Save time while revising

### 🎯 AI Quiz Generator
- Create practice quizzes from uploaded content
- Generate MCQs automatically
- Improve retention through active recall

### 🌐 Modern Web Experience
- Clean responsive UI
- Fast document processing
- Real-time AI responses

---


## 🛠️ Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes

### AI Layer
- Groq API
- Llama 3.3 70B Versatile

### PDF Processing
- pdf-parse

### Deployment
- Vercel

---

## 📂 Project Structure

```text
app/
 ├── api/
 │   ├── chat/
 │   ├── extract-pdf/
 │   ├── summary/
 │   └── quiz/
 │
 ├── page.tsx
 │
lib/
 ├── groq.ts
 └── pdf.ts

public/
types/
```

---

## ⚡ Getting Started

### Clone Repository

```bash
git clone https://github.com/ruthwikpvn12/LearnSphere-AI.git
cd LearnSphere-AI
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
GROQ_API_KEY=your_groq_api_key
```

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🎯 Use Cases

- Student Revision
- Lecture Notes Summarization
- Research Paper Understanding
- Exam Preparation
- Self Assessment through Quizzes
- Academic Document Analysis

---

## 🔮 Future Improvements

- Vector Database (pgvector / Supabase)
- Semantic Search
- Chat Memory
- Multi-PDF Support
- User Authentication
- Study Progress Tracking
- Flashcard Generation
- RAG Pipeline

---

## 📸 Screenshots

### Home Page
<img width="1841" height="961" alt="image" src="https://github.com/user-attachments/assets/11e989a4-407f-476f-945d-09f227acb67f" />


### AI Chat
<img width="1841" height="961" alt="image" src="https://github.com/user-attachments/assets/9ce2fb7f-a637-48b4-95dc-0c4ad9ec2be1" />


### Summary Generator and  Quiz Generator
<img width="1841" height="961" alt="image" src="https://github.com/user-attachments/assets/c5ddf017-7a0d-48b3-95b8-77857af51582" />


---

## 👨‍💻 Developer

**Ruthwik PVN**

B.Tech Student | AI & ML Enthusiast

GitHub:
https://github.com/ruthwikpvn12

---

## 📜 License

This project is developed for educational and learning purposes.

---
