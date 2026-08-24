# UrgentLyfe ⚡ — AI-Powered On-Demand Home Service Marketplace Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/software9798/urgentlyfe)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_%2B_Vite_%2B_Tailwind_CSS-blue.svg)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_%2B_Express_%2B_TypeScript-green.svg)](https://expressjs.com/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-%40google%2Fgenai_Gemini_2.5_Flash-amber.svg)](https://deepmind.google/technologies/gemini/)
[![Architecture](https://img.shields.io/badge/Architecture-Modular_Full--Stack-purple.svg)](https://github.com/software9798/urgentlyfe)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

**UrgentLyfe** is an end-to-end, production-ready, hyper-local on-demand home services marketplace built specifically for urban India (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, Kolkata). It empowers customers to book instant 30-minute express SOS repairs or scheduled home maintenance, equips verified service professionals with a dedicated partner portal & turn-by-turn navigation, and gives platform administrators real-time business intelligence and fraud shield controls.

---

## 📑 Table of Contents

- [🌟 System Architecture](#-system-architecture)
- [✨ Key Platform Features](#-key-platform-features)
  - [1. 🛒 Customer Experience & Booking Flow](#1--customer-experience--booking-flow)
  - [2. 👷 Service Partner & Technician Hub](#2--service-partner--technician-hub)
  - [3. 🛡️ Executive Admin & Fraud Shield Portal](#3-️-executive-admin--fraud-shield-portal)
  - [4. 🤖 Comprehensive Gemini AI Suite](#4--comprehensive-gemini-ai-suite)
  - [5. 🎁 Refer & Earn Viral Growth Engine](#5--refer--earn-viral-growth-engine)
  - [6. 🗺️ 1-Click Multi-App Navigation System](#6-️-1-click-multi-app-navigation-system)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Detailed Project Folder Structure](#-detailed-project-folder-structure)
- [⚡ Getting Started & Local Setup](#-getting-started--local-setup)
- [⚙️ Environment Variables](#️-environment-variables)
- [🔌 REST API Reference](#-rest-api-reference)
- [📱 Key Screenshots & UI Showcase](#-key-screenshots--ui-showcase)
- [🤝 Contributing & License](#-contributing--license)

---

## 🌟 System Architecture

```
===================================================================================
                       URGENTLYFE FULL-STACK ARCHITECTURE
===================================================================================

        ┌─────────────────────────────────────────────────────────────┐
        │            REACT 19 + TAILWIND FRONTEND CLIENT              │
        │  • Category Grid & Search    • 30-Min SOS Express Dispatch  │
        │  • Live GPS & OTP Gate       • Side-by-Side Compare Matrix  │
        │  • Partner & Admin Portals   • Multi-Tier Provider Select   │
        └──────────────────────────────┬──────────────────────────────┘
                                       │ HTTP / REST / Bearer JWT
        ┌──────────────────────────────┴──────────────────────────────┐
        │           MODULAR EXPRESS BACKEND (Port 3000)               │
        │  • Auth & User Routes        • Booking & Dispatch Engine    │
        │  • Provider & Admin Routes   • Referral & Cashback Engine   │
        │  • Role-Based Middleware     • In-Memory Database Store     │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │              GEMINI 2.5 FLASH AI ENGINE                     │
        │  • Multilingual AI Chatbot   • Interactive Voice Assistant  │
        │  • AI Diagnostic Doctor      • ML Dynamic Price Estimator   │
        │  • Smart NLP Search Intent   • Fraud & Anomaly Shield       │
        └─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Platform Features

### 1. 🛒 Customer Experience & Booking Flow
- **⚡ 30-Minute SOS Express Dispatch**: Immediate priority technician dispatch for emergency water leaks, power failures, AC breakdowns, or lockouts.
- **🔍 Smart Search & Categorization**: Instant search and filtering across AC Repair, Electrical, Plumbing, Carpentry, Deep Cleaning, RO Purifiers, and Home Appliances.
- **⚖️ Side-by-Side Service Comparison**: Compare up to 3 services simultaneously with real-time pricing breakdown, warranties, included tasks, and user ratings.
- **🥇 Provider Tier Selection**: Choose between **Standard Verified**, **Gold Pro Specialist**, or **Diamond Master Tech** with transparent skill and pricing tiers.
- **📍 Real-Time GPS Tracking & 4-Digit Security OTP**: Track incoming service partners live with milestone status updates and verify identity using a secure OTP before starting work.
- **🧾 Instant Tax Invoices**: Automated GST compliant tax invoice generator with printable formatted view and direct PDF export.
- **⭐ Post-Service Audio & Text Reviews**: Leave star ratings, written feedback, and recorded voice reviews analyzed by AI sentiment algorithms.

### 2. 👷 Service Partner & Technician Hub
- **📲 Live Incoming Job Dispatch**: Real-time notifications for nearby SOS emergency and scheduled bookings.
- **🗺️ 1-Click Directions with Apple/Google/Waze**: Instant deep-linking to launch Google Maps, Apple Maps, or Waze with pre-filled destination coordinates.
- **⏰ 1-Hour Service Alert Reminders**: Automated audio chime push alerts sent 1 hour before scheduled appointments with one-tap navigation triggers.
- **📊 Earnings & Performance Tracker**: Track completed jobs, customer satisfaction ratings, tips, and daily/weekly earnings.
- **🟢 Live Availability Switch**: Easily toggle between Available / On-Job / Offline modes.

### 3. 🛡️ Executive Admin & Fraud Shield Portal
- **📈 Marketplace Business Intelligence**: Live platform GMV, active jobs, top-earning technicians, category demand charts, and customer satisfaction metrics.
- **👥 Role-Based Account Control**: Manage customers, technicians, and administrators with one-click verification badges and account access toggles.
- **🚨 AI Fraud & Anomaly Detection Shield**: Real-time suspicious activity monitor flagging fake review clusters, rapid velocity booking anomalies, and unpaid cash abuse.
- **🗃️ Interactive Database Inspector**: Live raw inspection of all 14 internal data collections.

### 4. 🤖 Comprehensive Gemini AI Suite
1. **💬 Gemini Natural Language Assistant**: 24/7 intelligent conversational assistant in English, Hindi, and Hinglish with automated service recommendations.
2. **🎙️ Speech-to-Text Voice Booking**: Hands-free voice ordering assistant capable of understanding regional accents and converting speech to bookings.
3. **🩺 AI Diagnostic Doctor**: Multi-modal diagnostic wizard analyzing user problem descriptions and photos to identify appliance root causes and cost estimates.
4. **📊 ML Dynamic Price Estimator**: Dynamic pricing engine calculating labor, spare parts, peak-hour multipliers, and GST taxes.
5. **🔍 Smart NLP Search Engine**: Translates natural human problems (*"my bathroom pipe is bursting"*) into matching service items.

### 5. 🎁 Refer & Earn Viral Growth Engine
- **💰 ₹250 Instant Wallet Cashback**: Share unique referral codes via WhatsApp, SMS, or direct links.
- **🎁 Milestone Bonus Unlocks**: ₹250 wallet credit automatically deposited when a referred friend completes their first service.
- **👥 Referral Tracking Dashboard**: Real-time tracking of pending invites, registered friends, and total cashback earnings.

### 6. 🗺️ 1-Click Multi-App Navigation System
- Technicians can launch directions to customer premises using their preferred navigation app:
  - **Google Maps**: `https://www.google.com/maps/dir/?api=1&destination=...`
  - **Apple Maps**: `https://maps.apple.com/?daddr=...`
  - **Waze Navigation**: `https://waze.com/ul?q=...&navigate=yes`

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons, Responsive Mobile Bottom Bar |
| **Backend Server** | Node.js, Express, ESBuild (`dist/server.cjs`) |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt Password Hashing, Role Guards |
| **AI SDK** | `@google/genai` (Official Google GenAI SDK with Gemini 2.5 Flash) |
| **Data Layer** | In-Memory Database Store with 14 Relational Collections & Seed Data |
| **Utilities** | Geolocation API, Web Push Simulator, Canvas Audio Visualizer |

---

## 📂 Detailed Project Folder Structure

```text
UrgentLyfe/
├── server.ts                               # 🚀 Root Entry Point (Express + Vite SPA Handler on Port 3000)
├── index.html                              # 🌐 HTML Root Entry Point
├── package.json                            # 📦 Dependencies, scripts & build configuration
├── tsconfig.json                           # ⚙️ TypeScript strict configuration
├── vite.config.ts                          # ⚡ Vite frontend bundler config
├── metadata.json                           # 🏷️ Platform applet metadata & permissions
├── .env.example                            # 🔑 Environment variables template
│
├── frontend/                               # 💻 FRONTEND MODULE (React 19 + TypeScript + Tailwind)
│   └── src/
│       ├── main.tsx                        # ⚛️ React Root DOM Mounting
│       ├── App.tsx                         # 🧭 Main Application State & Modal Router
│       ├── index.css                       # 🎨 Tailwind CSS Styles & Custom Animations
│       ├── types.ts                        # 🏷️ Global Shared Frontend Types
│       ├── api/
│       │   └── client.ts                   # 🌐 Strongly Typed HTTP API Client (/api/*)
│       ├── data/
│       │   ├── database.ts                 # 💾 Client Data Models
│       │   └── mockData.ts                 # 📋 Client Mock Data
│       ├── utils/                          # 🛠️ Helper Utilities
│       │   ├── geoService.ts               # 📍 GPS & Locality Detection
│       │   ├── directionsHelper.ts         # 🗺️ 1-Click Multi-App Navigation Helper
│       │   ├── invoiceGenerator.ts         # 🧾 Tax Invoice PDF & Print Formatter
│       │   ├── performance.ts              # ⚡ Performance Monitoring
│       │   └── pushNotificationService.ts  # 🔔 Web Push Toast & Audio Notification Chime
│       └── components/                     # 🧩 Categorized React UI Components
│           ├── index.ts                    # 📦 Central Barrel Re-export
│           ├── auth/                       # 🔐 Authentication Components (AuthModal.tsx)
│           ├── layout/                     # 🧭 Navbar, HeroSection, MobileBottomNav, LocationBar
│           ├── services/                   # 🛠️ CategoryGrid, ServiceCard, ServiceDetailModal, CompareMatrix
│           ├── booking/                    # ⚡ BookingWizardModal, LiveTrackingModal, DirectionsModal, Invoice
│           ├── ai/                         # 🤖 FloatingAIAssistant, AIChatDrawer, AIDiagnosticModal, AIVoiceAssistant
│           ├── dashboards/                 # 📊 UserDashboard, PartnerDashboard, AdminPanelModal, APIDocsModal
│           ├── notifications/              # 🔔 NotificationCenterModal, PushNotificationToast
│           └── profile/                    # 👤 AddressManagerModal, ProviderProfileModal
│
├── backend/                                # 🖥️ BACKEND MODULE (Express + JWT + REST APIs)
│   ├── app.ts                              # 🛣️ Express App & Route Middleware Mounts
│   ├── types.ts                            # 🏷️ Backend Data Models, Enums & Interfaces
│   ├── gemini.ts                           # 🤖 Re-export module for Gemini configuration
│   ├── config/
│   │   └── gemini.ts                       # 🧠 Google GenAI SDK Client & JSON parser setup
│   ├── middleware/
│   │   └── authMiddleware.ts               # 🔐 JWT verification & Role-Based Access Control
│   ├── routes/                             # 🚦 Dedicated Route Handlers
│   │   ├── authRoutes.ts                   # 🔑 Signup, Login, OTP verification, Google Sign-in
│   │   ├── userRoutes.ts                   # 👤 Address Book CRUD, Profile updates, Notifications
│   │   ├── bookingRoutes.ts                # 📅 Booking lifecycle, 1-Hr alerts, Directions API
│   │   ├── serviceRoutes.ts                # 🛠️ Services, Categories, Reviews, Coupons
│   │   ├── providerRoutes.ts               # 👷 Technician profile, Skills, Availability
│   │   ├── adminRoutes.ts                  # 🛡️ User management, Provider verification, Stats
│   │   ├── referralRoutes.ts               # 🎁 Referral invites, Wallet stats, Simulations
│   │   ├── aiRoutes.ts                     # 🩺 Gemini AI Diagnosis, Smart Search, ML Pricing
│   │   └── analyticsRoutes.ts              # 📊 BI Analytics, Platform Health, DB inspectors
│   └── data/
│       ├── database.ts                     # 🗄️ In-Memory Database Engine & Auth Utilities
│       └── mockData.ts                     # 📊 Seed Data (Cities, Categories, Services, Providers)
│
└── ml_models/                              # 🧠 MACHINE LEARNING & AI ENGINE
    ├── index.ts                            # 📦 Unified ML Engine SDK Re-export
    ├── types.ts                            # 🏷️ ML Feature Vectors, Interfaces & Inference Schemas
    ├── pricing/
    │   └── pricingEngine.ts                # 📈 Elasticity Dynamic Surge Pricing Model
    ├── matching/
    │   └── partnerMatcher.ts               # 🎯 Bayesian Multi-Criteria Partner Ranking Algorithm
    ├── anomaly_detector/
    │   └── anomalyDetector.ts              # 🛡️ Velocity Fraud Shield & Anomaly Detector
    ├── nlp/
    │   └── intentClassifier.ts             # 🔍 Fast Emergency & Intent NLP Classifier
    ├── sentiment/
    │   └── sentimentScorer.ts              # ⭐ Voice & Text Review Sentiment Analyzer
    └── notebooks/
        ├── MODAL_TRAIN.ipynb               # 📓 Python Scikit-Learn Training & Exploration
        └── README.md                       # 📖 Notebooks Catalog & Architecture Docs
```

---

## ⚡ Getting Started & Local Setup

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`
- **Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/software9798/urgentlyfe.git
cd urgentlyfe
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Add your credentials to `.env`:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
JWT_SECRET="urgentlyfe_super_secret_jwt_key_2026"
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```text
http://localhost:3000
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## ⚙️ Environment Variables

| Variable | Required | Description | Default |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | Server-side Google Gemini API key for AI features | `""` |
| `JWT_SECRET` | No | Secret key for signing and verifying JWT tokens | `"urgentlyfe_super_secure_jwt_secret_key_2026"` |
| `PORT` | No | Server binding port | `3000` |
| `NODE_ENV` | No | Node runtime environment (`development` / `production`) | `"development"` |

---

## 🔌 REST API Reference

All backend APIs are prefixed under `/api/*` and protected via JWT authentication where applicable.

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Register new customer or technician | No |
| `POST` | `/api/auth/login` | Login with email/mobile + password | No |
| `POST` | `/api/auth/send-otp` | Send 4-digit mobile verification code | No |
| `POST` | `/api/auth/verify-otp` | Verify OTP code and login user | No |
| `POST` | `/api/auth/google` | Google OAuth one-tap sign-in | No |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | **Yes (Bearer)** |

### 📅 Bookings & Tracking (`/api/bookings`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/bookings` | Fetch all bookings | No |
| `GET` | `/api/bookings/:id` | Fetch specific booking details | No |
| `POST` | `/api/bookings` | Create instant SOS or scheduled booking | No |
| `PATCH` | `/api/bookings/:id/status` | Update booking status (`ACCEPTED`, `COMPLETED`) | No |
| `GET` | `/api/bookings/:id/directions` | Get Google, Apple & Waze navigation links | No |
| `POST` | `/api/bookings/trigger-1hr-alert`| Send 1-hour pre-service push notification | No |

### 🛠️ Services & Catalog (`/api`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/services` | Query services with search and category filter | No |
| `GET` | `/api/services/:id` | Fetch detailed service information | No |
| `GET` | `/api/categories` | List all service categories | No |
| `POST` | `/api/coupons/validate` | Check promo code discount & validity | No |
| `POST` | `/api/reviews` | Submit star rating and feedback review | **Yes (Bearer)** |

### 🤖 Gemini AI & Machine Learning (`/api`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/diagnose` | Multi-modal repair diagnosis & cost estimation | No |
| `GET` | `/api/ai/search` | Natural Language search intent parser | No |
| `POST` | `/api/ml/estimate-price` | Dynamic price benchmark calculation | No |
| `POST` | `/api/ml/match-partner` | Smart technician matching score algorithm | No |

### 🎁 Referrals & Cashback (`/api/referrals`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/referrals/stats` | Get user wallet balance & referral list | No |
| `POST` | `/api/referrals/invite` | Send WhatsApp / SMS invitation | No |
| `POST` | `/api/referrals/simulate-complete` | Trigger ₹250 referral reward deposit | No |

### 🛡️ Admin & Analytics (`/api/admin` & `/api/analytics`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/admin/stats` | Executive platform GMV & booking metrics | **Admin Role** |
| `GET` | `/api/admin/users` | List all registered users | **Admin Role** |
| `PATCH` | `/api/admin/users/:id` | Block/unblock or change user role | **Admin Role** |
| `GET` | `/api/admin/fraud-alerts` | Fetch AI anomaly & suspicious activity logs | No |
| `GET` | `/api/analytics/business-intelligence` | Monthly revenue trends & category demand | No |
| `GET` | `/api/health` | Container & Gemini API health status probe | No |

---

## 📱 Default Demo Credentials

You can test various role views directly using these pre-seeded demo accounts:

| Role | Email / Login | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `aarav@example.com` | `pass123` | Book services, compare, track orders, refer friends |
| **Service Partner** | `rajesh.ac@example.com` | `pass123` | Accept jobs, view directions, 1-hr alerts, track earnings |
| **Administrator** | `admin@urgentlyfe.com` | `admin123` | View BI stats, fraud alerts, manage users & providers |

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <b>Saurabh Kumar</b> for UrgentLyfe India. Powered by React 19, Node.js & Google Gemini AI.</sub>
</div>
