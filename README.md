<div align="center">

# 🌍 TravelLens

**An AI-powered travel logging and analytics platform that turns your trips into insights**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Groq](https://img.shields.io/badge/Groq-AI%20API-F55036?style=flat-square)](https://groq.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)

*Full-stack · AI-integrated · ML-powered *

</div>

---

## Overview

TravelLens is a full-stack travel companion that goes beyond basic trip logging. Users track trips, places, hotels, and expenses — and the platform analyzes that data to surface personalized insights: travel personality, spending patterns, seasonal preferences, and AI-powered destination recommendations.

Built collaboratively: the **frontend, UI/UX, ML analytics engine, Groq AI integration, and performance layer** were designed and implemented by [Eshal Fathima](https://github.com/Eshal-Fathima). The database schema and backend data models were handled by the collaborator.

---

## What It Does

| Feature | Description |
|---------|-------------|
| **Trip Logger** | Create, edit, and delete trips with dates, destinations, and notes |
| **Place Tracking** | Log visited places with ratings and personal notes |
| **Hotel Management** | Track accommodation with automatic cost calculations |
| **Expense Tracker** | Monitor spending by category with live visual charts |
| **Travel Personality** | KMeans clustering segments users into 5 travel personas |
| **Spotify Wrapped-style Insights** | Annual travel summary with stats and highlights |
| **AI Recommendations** | Groq-powered destination and activity suggestions |
| **Budget Optimization** | ML-driven tips based on your spending patterns |

---

## My Contributions

Here's a breakdown of what I owned end-to-end:

### Frontend Architecture & UI/UX
Built the entire React 18 frontend from scratch using Vite, Tailwind CSS, and React Router. Designed and implemented all 7 core pages — Dashboard, Trip Logger, Places Logger, Hotel Logger, Expense Tracker, Insights, and Recommendations — with a consistent design system, responsive layout, smooth animations, and micro-interactions throughout.

### Data Visualizations
Integrated Recharts to build interactive expense charts, travel frequency graphs, spending breakdowns by category, and the Insights summary dashboard. Every chart is data-driven and updates in real time as users log activity.

### Groq API Integration
Connected the Groq API to power the AI recommendation engine. The integration takes a user's travel history (destinations, place types, ratings, budget tier) and returns personalized destination suggestions and activity ideas. Built the prompt engineering layer, API call handling, response parsing, and the UI that surfaces results.

### ML Analytics Engine
Implemented the machine learning layer in Python using scikit-learn:
- **KMeans Clustering** segments users into 5 travel personas based on spending, destination diversity, and activity preferences
- **Cosine Similarity** drives the recommendation engine, matching users to destinations based on past trips
- **Spending Pattern Analysis** with trend detection and budget utilization tracking
- **Travel Frequency Analysis** with seasonal preference detection

### Performance & Security Layer
- **API Response Caching** — 24-hour cache for external API calls (GeoDB, OpenTripMap) to reduce latency and API costs
- **Lazy Loading & Code Splitting** on the frontend for fast initial load
- **JWT Authentication Flow** — token generation, protected routes, and session management
- **Input Validation** — server-side validation for all endpoints

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| **React 18** | Component-based UI with hooks |
| **Vite** | Fast development server and build tool |
| **Tailwind CSS** | Utility-first responsive styling |
| **Recharts** | Interactive data visualizations |
| **React Router** | Client-side navigation |
| **Lucide React** | Consistent icon system |

### Backend
| Tool | Purpose |
|------|---------|
| **Flask** | REST API with Blueprint architecture |
| **SQLAlchemy ORM** | Database abstraction and query management |
| **JWT (Flask-JWT)** | Secure token-based authentication |
| **Flask-CORS** | Cross-origin request handling |

### ML & Analytics
| Tool | Purpose |
|------|---------|
| **scikit-learn** | KMeans clustering + cosine similarity |
| **pandas** | Data manipulation and aggregation |
| **NumPy** | Numerical operations |
| **Groq API** | LLM-powered travel recommendations |

### Data & Infrastructure
| Tool | Purpose |
|------|---------|
| **MySQL** | Relational database for all user data |
| **GeoDB Cities API** | Real-time destination metadata |
| **OpenTripMap API** | Attraction and place information |

---

## Project Structure

```
TravelLens/
├── frontend/                     # React frontend (Eshal)
│   └── src/
│       ├── pages/                # 7 core pages — Dashboard, Trips, Places, Hotels,
│       │                         # Expenses, Insights, Recommendations
│       ├── components/           # Reusable UI components
│       ├── charts/               # Recharts visualization components
│       ├── contexts/             # React context for auth + state
│       ├── hooks/                # Custom hooks
│       └── utils/                # API helpers, formatters
│
├── backend/                      # Flask backend
│   ├── routes/                   # API route handlers
│   ├── models/                   # SQLAlchemy database models (collaborator)
│   ├── analytics/                # ML analytics engine (Eshal)
│   ├── ml/                       # KMeans, cosine similarity, recommendations (Eshal)
│   └── utils/                    # Caching, validation, JWT helpers (Eshal)
│
├── database/                     # MySQL schema (collaborator)
│   └── schema.sql
│
├── start.sh / start.bat          # One-command startup scripts
└── SETUP.md                      # Environment configuration guide
```

---

## ML Features In Depth

### Travel Personality Detection (KMeans Clustering)
Users are clustered into 5 personas based on their logged trips:

| Persona | Characteristics |
|---------|----------------|
| **Budget Explorer** | Low avg spend, high trip frequency, diverse destinations |
| **Cultural Traveler** | Museums, heritage sites, moderate budget |
| **Adventure Seeker** | Outdoor activities, nature-heavy destinations |
| **Luxury Traveler** | High spend per trip, premium accommodation |
| **Family Vacationer** | Group travel, family-oriented activities |

The clustering runs on each user's aggregated metrics — average spend per trip, place type distribution, trip frequency, and destination diversity score — and updates as they log more trips.

### Recommendation Engine (Cosine Similarity)
Destinations are represented as feature vectors (climate type, activity categories, avg cost, popularity). A user's travel history is aggregated into a preference vector, and cosine similarity scores match them to the closest destinations they haven't visited yet.

### Analytics Engine
The analytics module computes:
- **Spending trend detection** — is the user spending more or less over time?
- **Seasonal preference scoring** — which months/seasons does this user travel most?
- **Destination diversity index** — how varied are the user's travel choices?
- **Budget utilization rate** — what percentage of planned budget is typically used?

These feed the Spotify Wrapped-style Insights page with personalized stats and narrative summaries.

---

## Groq API Integration

The AI layer takes a structured prompt built from the user's travel profile:

```python
prompt = f"""
You are a travel advisor. Based on this user's travel history:
- Top destination types: {user_profile['destination_types']}
- Travel persona: {user_profile['persona']}
- Average budget per trip: ${user_profile['avg_spend']}
- Visited: {user_profile['visited_destinations']}

Recommend 3 destinations they haven't visited with specific activities.
Respond in JSON format only.
"""
```

Responses are parsed, validated, and surfaced through the Recommendations page with destination cards, activity suggestions, and budget estimates.

---

## Core API Endpoints

### Authentication
```
POST /api/auth/register      → Register user
POST /api/auth/login         → Login, returns JWT
GET  /api/auth/profile       → Get current user (protected)
```

### Trip Management
```
GET    /api/trips            → All user trips
POST   /api/trips            → Create trip
PUT    /api/trips/<id>       → Update trip
DELETE /api/trips/<id>       → Delete trip
```

### Analytics & AI
```
GET /api/insights/<user_id>           → Travel insights + persona
GET /api/recommendations/<user_id>    → AI-powered destination suggestions
GET /api/expenses/<trip_id>/summary   → Expense breakdown by category
```

---

## Quickstart

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MySQL 8.0+

### One-command startup (after setup)
```bash
# Mac/Linux
./start.sh

# Windows
start.bat
```

### Manual setup
```bash
git clone https://github.com/Eshal-Fathima/TravelLens
cd TravelLens

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env        # Fill in your credentials
flask run

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Frontend → `http://localhost:5173`  
Backend API → `http://localhost:5000`

### Environment Variables
```
DATABASE_URL=mysql+pymysql://username:password@localhost/travellens
SECRET_KEY=your-flask-secret
JWT_SECRET_KEY=your-jwt-secret
GROQ_API_KEY=your-groq-api-key
GEODB_API_KEY=your-geodb-key         # Optional
OPENTRIPMAP_API_KEY=your-otm-key     # Optional
```

---

## Performance Decisions

**Why Groq over OpenAI?** Groq's inference speed (tokens/sec) is significantly faster for real-time recommendation generation, which matters for a feature that runs on page load.

**Why KMeans for segmentation?** The feature space is low-dimensional and interpretable — KMeans produces clusters that map cleanly to recognizable travel personas without overfitting on limited user data.

**Why cache external API responses?** GeoDB and OpenTripMap have rate limits and latency. Caching destination metadata for 24 hours means the ML recommendation engine can run without blocking on external API calls.

---

## Skills Demonstrated

- **Full-stack development** — End-to-end ownership of a production-grade web application
- **React architecture** — Component design, custom hooks, context, routing, and state management
- **LLM integration** — Prompt engineering, API handling, and structured response parsing with Groq
- **ML implementation** — KMeans clustering and cosine similarity applied to a real user profiling problem
- **Data visualization** — Interactive, data-driven charts with Recharts
- **Performance engineering** — Caching, lazy loading, and JWT security from scratch
- **Collaborative development** — Feature ownership within a 2-person team with clear separation of concerns

---

## About

Built as a collaborative full-stack project exploring how ML and LLM capabilities can turn raw travel logs into genuinely useful, personalized insights.

**Eshal Fathima** — Frontend, UI/UX, ML Engine, Groq Integration, Performance Layer  
[GitHub](https://github.com/Eshal-Fathima) · CS Undergrad, Big Data Analytics · SRM University
