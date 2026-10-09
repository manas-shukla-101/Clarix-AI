# Clarix: Your Data, Visualized in Seconds

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![ECharts](https://img.shields.io/badge/Apache_ECharts-E43961?style=for-the-badge&logo=apache-echarts&logoColor=white)
![DuckDB](https://img.shields.io/badge/DuckDB-FFF000?style=for-the-badge&logo=duckdb&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<div align="center">
  <img src="public/logo.png" alt="Clarix Logo" width="200" style="border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
  <p><i>A 100% browser-based, AI-assisted data visualization and dashboarding workspace.</i></p>
</div>

---

## 📑 Table of Contents

| Section | Description |
|---------|-------------|
| [🧠 Overview](#-clarix-your-data-visualized-in-seconds) | Project introduction and badges |
| [⚠️ Problem](#-the-problem) | The challenge of complex, server-reliant visualization |
| [💡 Solution](#-the-solution-clarix) | Fast, local, drag-and-drop dashboarding |
| [🛠️ Tech Stack](#-the-tech-stack) | Core technologies used |
| [🎯 Logic Flow](#-strategic-logic-flow) | How Clarix parses and visualizes data |
| [🚀 Quick Start](#-quick-start) | Setup and deployment instructions |
| [🌟 Key Features](#-key-features) | Standout functionalities |
| [💼 Use Cases](#-use-cases) | Practical applications |
| [👋 Connect](#-socials) | Social links |

---

## ⚠️ The Problem
Traditional data visualization requires either complex BI tools (like Tableau or PowerBI) that take hours to learn, or cloud-based software that forces you to upload highly sensitive business data to external servers. Creating a quick, shareable dashboard from a simple CSV or Excel file is often much harder than it needs to be.

## 💡 The Solution: Clarix
Clarix is a lightning-fast, zero-friction visualization workspace that runs **entirely in your browser**. It requires zero signups and sends zero data to external servers. By utilizing in-browser data parsing (WASM) and AI heuristics, it auto-detects your column types, instantly suggests the most insightful charts, and lets you organize them on a beautiful, glassmorphic drag-and-drop canvas.

### 🛠️ The Tech Stack
* **Frontend:** React + Vite (Premium Glassmorphism UI)
* **Styling:** Tailwind CSS + custom keyframe animations
* **Visualization Engine:** Apache ECharts (`echarts-for-react`)
* **Layout Management:** `react-grid-layout`
* **Local Data Processing:** PapaParse, XLSX, and DuckDB (WASM)
* **Sharing Infrastructure:** Supabase (for optional public dashboard links)

---

## 🎯 Strategic Logic Flow

### 1. Zero-Server Ingestion
Drag and drop CSVs, JSON, Excel files, or paste a Google Sheets URL. The file is processed instantly on the client side without any network overhead, ensuring 100% data privacy.

### 2. AI-Powered Heuristics
The system runs a local data-type detection engine to classify your columns (e.g., Dates, Currency, Categories, Quantities). Based on these typings, Clarix's recommendation logic instantly proposes the best charts (Line, Bar, Pie, Scatter, etc.) to represent your data accurately.

### 3. Interactive Dashboarding
Users arrange their charts on a collision-aware, dynamic grid system. The layout state is tracked in real-time, allowing users to export the perfect view as a high-resolution PNG, a PDF, or to a permanent live Supabase URL.

---

## 🚀 Quick Start

### Option 1: Vercel Deployment (Recommended — Free Tier!)
Because Clarix relies on client-side processing, it deploys seamlessly as a static site.
1. Push this repository to GitHub.
2. Go to [Vercel.com](https://vercel.com/) and create a new project.
3. Import your GitHub repository. Vercel will auto-detect the Vite framework.
4. Add your `.env.local` Supabase credentials in the Vercel Environment Variables settings.
5. Click **Deploy**.

### Option 2: Local Development
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/manas-shukla-101/Clarix-AI.git
   cd Clarix
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env.local` file at the root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GROQ_API_KEY=your_groq_api_key
   ```
4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
5. Access the gorgeous UI at `http://localhost:5173`.

---

## 🌟 Key Features

- **100% Browser-Based Processing:** Absolute data privacy. Your raw data never touches a server.
- **Smart Chart Generation:** Intelligent auto-detection of column metrics to skip manual configuration.
- **Premium Glassmorphic UI:** A visually stunning frontend with hover micro-animations and glowing gradients.
- **Drag & Drop Canvas:** Resize and arrange charts dynamically with `react-grid-layout`.
- **Instant Sharing & Exporting:** One-click download to PDF/PNG via `html-to-image`, or generate a shareable URL via Supabase.

## 💼 Use Cases

- **Startup Pitch Decks:** Quickly turn user-growth CSVs into beautiful charts for presentations.
- **Financial Analysis:** Drop in Excel sheets to instantly visualize monthly burn rates or revenue.
- **Internal Team Sharing:** Generate a quick dashboard link from Google Sheets to share on Slack.
- **Rapid Prototyping:** Skip Tableau and instantly visualize JSON dumps from API endpoints.

---

**Designed and Developed with ❤️ by Manas Shukla**

---

## 🌐 Socials:
[![Portfolio](https://img.shields.io/badge/Portfolio-Website-blue)](https://manas-shukla-portfolio.framer.website) [![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/manas_shukla_101) [![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://linkedin.com/in/manas-shukla-006774370) [![email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:shuklamanas8928@gmail.com)
