# GreenPlus

GreenPlus is a full-stack environmental sustainability application that combines eco tracking, educational quizzes, AI-assisted predictions, and user progress gamification. It is designed to help users monitor their energy, water, methane, and carbon impact while exploring practical sustainability actions.

## Overview

The project includes a React + Vite frontend, a Flask backend, MongoDB-backed persistence, and machine-learning-powered environmental prediction modules. The application supports dashboards, eco tasks, action recommendations, quiz-based learning, reward progression, and external weather-driven prediction APIs.

## Features

- Dashboard for energy, water, carbon, and methane activity
- User authentication and protected routes
- Intent-first Leafy assistant with English, Gujarati, Hindi, Hinglish, and Gujlish support
- Context-aware in-app eco notifications with cooldowns, quiet hours, duplicate detection, and read state
- Progressive eco gamification with XP, levels, badges, and streaks
- Educational quizzes and sustainability learning modules
- Environmental predictions for energy, rainfall, air quality, temperature, wind, and UV index
- Research and subsidy scheme discovery
- Realtime weather-driven estimation features
- MongoDB persistence for user records and progress data

## Architecture

Frontend → API → Backend services → Repositories → MongoDB

Frontend → Prediction APIs → ML service layer → Model artifacts / weather providers

## Tech Stack

- Frontend: React, Vite, React Router, Framer Motion
- Backend: Flask, Python
- Database: MongoDB
- ML: scikit-learn, joblib, pandas, NumPy
- Auth: JWT-based access tokens
- External data: Open-Meteo APIs

## Project Structure

- backend/: Flask application, config, routes, repositories, services, database access
- frontend/: React app and UI assets
- ai/: ML models, training scripts, and evaluation metrics
- datasets/: project datasets and reference catalog
- docs/: API and database documentation
- assets/: static design resources

## Requirements

- Python 3.11+
- Node.js 18+
- MongoDB running locally or accessible via URI
- npm for frontend install

## Installation

1. Create and activate a Python environment.
2. Install backend dependencies:
   pip install -r backend/requirements.txt
3. Install frontend dependencies:
   cd frontend && npm install
4. Copy environment examples and configure secrets.

## Environment Variables

Set the following variables for backend execution:

- APP_ENV
- MONGO_URI
- MONGO_DB_NAME
- API_HOST
- API_PORT
- JWT_SECRET
- JWT_ACCESS_TOKEN_TTL_SECONDS
- CORS_ORIGINS
- OPEN_METEO_BASE_URL
- ADMIN_SETUP_KEY
- NOTIFICATION_DAILY_LIMIT
- NOTIFICATION_COOLDOWN_MINUTES

In production, `JWT_SECRET` must be unique and at least 32 characters long, and `ADMIN_SETUP_KEY` must be a private invitation key. Never deploy with the development JWT secret.

Use the included example file as a starting point: [backend/.env.example](backend/.env.example)

## MongoDB Setup

Run MongoDB locally or point the app to a managed MongoDB instance. For local development, use a URI similar to:

mongodb://127.0.0.1:27017

The default application database is greenplus.

## Running Frontend

cd frontend
npm run dev

## Running Backend

From the project root:

.\.venv1\Scripts\python.exe -m backend.app

## ML Models

The repository includes model artifacts and training scripts under ai/. Model performance varies by use case and geographic applicability. Model gating should reject low-quality deployments before they are used in production-level predictions.

## API Documentation

The backend exposes REST endpoints under /api, including:

- `POST /api/assistant/messages` for authenticated intent-first conversational replies
- `GET /api/notifications` for the authenticated user's in-app notification center
- `POST /api/notifications/generate` for event-based notification evaluation
- `PATCH /api/notifications/<id>/read` and `POST /api/notifications/read-all` for read state
- `PATCH /api/notifications/<id>/dismiss` for dismissal
- `GET/PATCH /api/notifications/preferences` for quiet hours, channels, and category preferences
- `GET /api/progress` and `PATCH /api/progress/state` for user-scoped progress persistence

Assistant requests may include `history` and a small `context` object. Notification generation accepts weather values such as `rainProbability`, `cloudCover`, `temperature`, and `solarGeneration`, plus explicit user context such as `solarAvailable` and `solarActivities`. Missing context suppresses recommendations rather than assuming the user owns equipment.

## Testing

Python regression tests are stored under backend/tests/.

The repository includes CI checks for backend compilation/tests and frontend lint/build:

```powershell
$env:APP_ENV = "test"
.\.venv1\Scripts\python.exe -m pytest backend/tests -q
cd frontend
npm ci
npm run lint
npm run build
```

The NLU regression matrix in `backend/tests/test_nlu_matrix.py` covers all 27 declared intent labels, required multilingual modes, follow-up context, and natural-answer numeric suppression.

## Development

- Use a local MongoDB instance for development.
- Keep secrets in environment variables, not source files.
- Validate API contracts before shipping features.
- Prefer authenticated server-side validation to frontend-only checks.

## Production Deployment

Recommended deployment pattern:

- Nginx or load balancer
- Gunicorn WSGI workers
- Flask application
- MongoDB instance
- environment-based secret management

For local container deployment, use `docker compose up --build`. The API exposes
`/api/health` for liveness and `/api/ready` for readiness. In production,
`/api/ready` reports failure when MongoDB is unavailable.

## Security

- JWT access tokens required for protected requests
- Role checks enforced on admin endpoints
- CORS restricted to configured origins
- Strong input validation and structured API errors
- Protected profile updates keyed to the authenticated user

## Known Limitations

- Some ML artifacts are experimental or geographically scoped.
- Some legacy naming and directory artifacts remain.
- The project still needs broader production maturity work in CI, deployment, testing, and model governance.

## Model Limitations

The project contains models with varying quality and geographic assumptions. Not every model should be treated as globally reliable. Low-performing or weakly validated models should be rejected or replaced with deterministic baselines or external data sources.

## Future Improvements

- Expand coverage for backend and frontend testing
- Separate model versioning and training artifacts from production bundles
- Harden observability, logging, and health checks
- Add CI/CD pipeline and container deployment setup
- Continue refactoring legacy UI state into clearer server/client boundaries
