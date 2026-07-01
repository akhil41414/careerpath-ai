# Pathly — AI Career Guidance Platform

Pathly is an intelligent career mapping and guidance platform designed to help students and professionals navigate their career paths with precision.

## ⚠ The Problem Statement
Most career tests and guidance platforms give generic, high-level answers. When someone says "I know Python and SQL and want to build things," they don't need a personality quiz—they need to know exactly which roles fit them, what skills they are missing, how their current resume scores against real jobs, and what their step-by-step roadmap should look like.

## 💡 How We Solved It
We built a centralized, AI-powered hub that maps out the entire journey from "no idea" to "hired." Pathly takes your current skills and interests, finds exact career matches, identifies skill gaps, and generates a realistic, actionable roadmap complete with learning resources and resume scoring. 

Everything is stored securely in a PostgreSQL database (Supabase) so you can pick up your route right where you left off.

---

## 🚀 Features

### 1. Career Explorer
* **What it does:** You input your skills and interests, and it returns the top 3 best-fit careers.
* **How to use it:** Navigate to the Explorer, type in your skills, and get a detailed breakdown of your fit score and the exact skill gaps standing between you and the role.

### 2. Resume Analyzer
* **What it does:** A private, server-side resume scanner that compares your resume against a target job description.
* **How to use it:** Upload a PDF or Word document of your resume, paste a target job description, and get a numeric score alongside a severity-ranked list of things to fix.

### 3. Roadmap Builder
* **What it does:** Generates a custom 6-stage roadmap based on your target role.
* **How to use it:** Enter your goal role. The AI generates milestones with specific projects to ship. Check off stages as you complete them to track progress. You can also export the roadmap as a beautiful PDF!

### 4. Course & Resource Recommendations
* **What it does:** Suggests the best places to learn the skills you are missing.
* **How to use it:** Enter a skill you need to learn. Pathly generates 8 highly-rated courses and tutorials (mixing platforms like Coursera/Udemy with high-quality free YouTube playlists) and provides direct clickable links so you can start learning immediately.

### 5. Salary Insights
* **What it does:** Provides detailed market salary data for your target role.
* **How to use it:** Enter a job title and location. It visualizes salary bands based on experience levels and shows you a 5-year growth outlook and demand score.

---

## 🛠️ Technology Stack

* **Frontend:** Vanilla HTML, CSS, JavaScript (No heavy frameworks for maximum performance and simplicity)
* **Backend:** Node.js running on Vercel Serverless Functions
* **Database:** Supabase (PostgreSQL) for storing user accounts and profile progress securely
* **AI Engine:** Llama 3.3 70B (via Groq) for lightning-fast analysis and roadmap generation
* **Authentication:** Custom JWT-based auth + Google OAuth integration
* **Document Parsing:** `pdf.js` and `mammoth.js` for local resume reading

## ⚙️ Getting Started

1. Clone this repository.
2. Ensure you have Node.js installed.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your `.env` variables for Supabase and the AI Provider.
5. Run the local Vercel development server:
   ```bash
   npm run dev
   ```
6. Open your browser to `http://localhost:3000` to start mapping your career!
