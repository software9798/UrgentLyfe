# UrgentLyfe ⚡ — AI-Powered On-Demand Home Service Marketplace Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/urgentlyfe/urgentlyfe)
[![Framework](https://img.shields.io/badge/Frontend-React_19_%2B_Vite_%2B_Tailwind_v4-blue.svg)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_%2B_Express-green.svg)](https://expressjs.com/)
[![AI Engine](https://img.shields.io/badge/AI Engine-%40google%2Fgenai_Gemini_3.6_Flash-amber.svg)](https://deepmind.google/technologies/gemini/)
[![Docker](https://img.shields.io/badge/Container-Docker_%2B_Docker_Compose-blueviolet.svg)](https://www.docker.com/)

**UrgentLyfe** is an end-to-end, production-ready, AI-driven hyper-local home services marketplace built specifically for urban India (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune). It enables customers to book instant 30-minute express SOS repairs or scheduled home maintenance services while providing verified service professionals with a dedicated partner app and administrative team with an executive control panel.

---

## 🌟 Visual Application Highlights

```
===================================================================================
                       URGENTLYFE ARCHITECTURE OVERVIEW
===================================================================================

       ┌─────────────────────────────────────────────────────────────┐
       │                CUSTOMER SPA (React 19 + Vite)               │
       │  • Category Grid & Search    • Interactive 30-Min SOS Booking│
       │  • User Dashboard & History   • Live GPS Tracking & OTP Gate│
       └──────────────────────────────┬──────────────────────────────┘
                                      │
       ┌──────────────────────────────┴──────────────────────────────┐
       │              EXPRESS + VITE NODE BACKEND (server.ts)        │
       │  • REST API Controllers      • JWT Auth & Bcrypt Security  │
       │  • Real-Time Dispatch Engine • Full In-Memory State Engine │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
       ┌──────────────────────────────┴──────────────────────────────┐
       │                  GEMINI 3.6 FLASH AI ENGINE                 │
       │  • Multilingual AI Chatbot   • Natural Language Voice AI   │
       │  • Dynamic Price Estimator   • Computer Vision Repair Scan │
       │  • Provider Ranking Algorithm• AI Fraud & Anomaly Detector │
       └─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Functional Modules

### 1. 🛒 Customer Marketplace App
- **30-Minute Express SOS Dispatch**: Rapid emergency service booking for AC repair, short circuits, water leaks, and lockouts.
- **Smart Category Navigation**: AC Service, Electrical, Plumbing, Carpentry, Deep Cleaning, RO Water Purifiers, Appliance Repair.
- **Live GPS Order Tracking**: Real-time status tracker with verified technician contact, live map updates, and 4-digit security OTP code validation.
- **Customer Dashboard & Profile**: Address manager, active booking management, GST PDF invoices, bookmarked services, and voice reviews.

### 2. 👷 Partner & Provider Dashboard
- **Instant Job Alerts**: Real-time incoming SOS dispatch cards with distance, customer notes, and total payout details.
- **Job Lifecycle Controls**: Accept, Start Route, Work In Progress, and OTP Job Completion.
- **Earnings & Payout Analytics**: Daily, weekly, and monthly net payout tracking.
- **AI Provider Quality Ranking**: Transparent performance score (#1 rank badge) derived from customer speech feedback and punctuality.

### 3. 🛡️ Admin Control & Business Intelligence
- **Platform Executive Stats**: Real-time Gross Merchandise Value (GMV), total active providers, pending dispatches, and fulfillment rates.
- **Dynamic Database Inspector**: Interactive table inspector for 14 system tables (Users, Providers, Bookings, Categories, Payments, Logs).
- **User & Provider Account Management**: One-click account block/unblock and KYC document clearance.
- **Executive BI Reports**: Monthly revenue growth charts, service category demand breakdowns, and JSON export capabilities.

---

## 🤖 Comprehensive AI & Machine Learning Suite

UrgentLyfe integrates **9 unified Gemini 3.6 Flash AI modules**:

1. **💬 Gemini Natural Language Chatbot**: 24/7 intelligent customer assistant handling queries in English, Hindi, and Hinglish with automated service card suggestions.
2. **🎙️ Speech-to-Text Voice Assistant**: Voice booking assistant with real-time audio visualization for hands-free booking in regional Indian accents.
3. **🩺 AI Diagnostic Doctor**: Step-by-step diagnostic assistant that analyzes appliance sounds and error codes to identify problems before booking.
4. **📊 Dynamic Price Benchmark Estimator**: AI market price calculator that projects fair repair costs based on location, parts required, and market rates.
5. **⭐ Provider Quality & Ranking Score**: Sentiment analysis engine that processes voice reviews to calculate a 100-point quality score and ranking.
6. **🔍 AI Smart NLP Search**: Semantic search engine that parses natural queries (e.g. *"I need someone to fix my leaking tap"*) into precise service matches.
7. **🚨 AI Fraud & Anomaly Shield**: Anomaly detector that flags suspicious velocity spikes, fake reviews, and payment pattern anomalies.
8. **🖼️ Computer Vision Repair Detector**: Image classification module that analyzes uploaded damage photos (e.g. broken pipes or fried circuit boards) to detect required services.
9. **📈 Business Intelligence Analytics**: Predictive engine analyzing regional service demand and seasonal revenue trends.

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Motion (Framer Motion), Lucide React Icons.
- **Backend**: Node.js, Express, ESBuild bundling, TypeScript (`tsx`).
- **Authentication**: Custom JWT (JSON Web Tokens) with Bcrypt hashing and role-based guards (`CUSTOMER`, `PROVIDER`, `ADMIN`).
- **AI Engine**: `@google/genai` (Official Google GenAI SDK with Gemini 3.6 Flash).
- **Containerization**: Multi-stage Docker & Docker Compose.

---

## 📂 Folder Structure

```
UrgentLyfe/
├── .env.example              # Environment variables template
├── .gitignore                 # Git ignore rules
├── Dockerfile                 # Multi-stage production container setup
├── docker-compose.yml         # Container orchestration manifest
├── index.html                 # Main SPA entrypoint
├── package.json               # Dependencies and build scripts
├── metadata.json              # Platform applet configuration
├── server.ts                  # Production Express server + AI API endpoints
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite bundler configuration
└── src/
    ├── main.tsx               # Client React initialization
    ├── App.tsx                # Main App shell and modal router
    ├── index.css              # Tailwind CSS directives
    ├── types.ts               # Shared TypeScript interfaces & types
    ├── api/
    │   └── client.ts          # Typed REST API Client wrapper
    ├── data/
    │   └── database.ts        # In-memory mock database & seed store
    └── components/
        ├── AddressManagerModal.tsx
        ├── AdminPanelModal.tsx
        ├── AIChatDrawer.tsx
        ├── AIDiagnosticModal.tsx
        ├── AIVoiceAssistantModal.tsx
        ├── APIDocsModal.tsx
        ├── AuthModal.tsx
        ├── BookingWizardModal.tsx
        ├── CategoryGrid.tsx
        ├── HeroSection.tsx
        ├── LiveTrackingModal.tsx
        ├── Navbar.tsx
        ├── PartnerDashboard.tsx
        ├── ProviderProfileModal.tsx
        ├── ServiceCard.tsx
        ├── ServiceDetailModal.tsx
        └── UserDashboard.tsx
```

---

## ⚡ Quick Start & Installation Guide

### Prerequisites
- Node.js `>= 20.0.0`
- npm `>= 10.0.0`
- Docker & Docker Compose (Optional for container deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/urgentlyfe/urgentlyfe.git
cd urgentlyfe
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and set your credentials:
```bash
cp .env.example .env
```
Ensure `GEMINI_API_KEY` is configured:
```env
GEMINI_API_KEY="your_actual_gemini_api_key"
JWT_SECRET="urgentlyfe_secure_jwt_secret_key_2026"
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🐳 Running with Docker

You can containerize and launch UrgentLyfe using Docker Compose:

```bash
docker-compose up --build -d
```
Access the application on `http://localhost:3000` with automated health checks enabled at `/api/health`.

---

## 🔌 API Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Container health probe |
| `/api/services` | `GET` | Fetch all service offerings |
| `/api/bookings` | `POST` | Create a new SOS / Scheduled booking |
| `/api/auth/login` | `POST` | Authenticate customer, partner, or admin |
| `/api/ai/chat` | `POST` | Gemini chatbot response generation |
| `/api/ai/voice` | `POST` | Speech-to-text transcript & natural reply |
| `/api/ai/smart-search` | `POST` | Natural language NLP search & service matching |
| `/api/ai/image-detect` | `POST` | Computer Vision repair photo analysis |
| `/api/admin/fraud-alerts` | `GET` | Fetch AI anomaly & fraud threat list |
| `/api/analytics/business-intelligence` | `GET` | Executive marketplace BI analytics |

---

## 🤝 Contribution Guidelines

1. Fork the project repository.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request for code review.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
