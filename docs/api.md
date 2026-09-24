# GreenPlus API

Base URL: `http://127.0.0.1:5000`

## System

- `GET /api/health`: API, MongoDB, and model availability.

## Authentication

- `POST /api/auth/register`: create and store a user in MongoDB.
- `POST /api/auth/login`: retrieve a user after password verification.

Registration and login require `name`, `email`, and a password of at least eight characters. Passwords are never stored in plain text.

## Predictions

- `POST /api/predict/carbon`: carbon model prediction.
- `POST /api/predict/energy`: energy model prediction.
- `POST /api/predict/uv-index`: daily UV-index prediction. Accepts optional `latitude` and `longitude`; returns `uv_index`, `forecast_date`, and location fields using Open-Meteo daily forecast data.
- `POST /api/predict/wind`: current wind-speed prediction. Accepts optional `latitude` and `longitude`; returns predicted and observed `wind_speed_kmh`, timestamp, and location fields using Open-Meteo current weather data.
- `POST /api/analyze/energy`: deterministic household energy, bill, solar, and appliance analysis.

ML models are loaded lazily on the first prediction request. Missing models return `503`; the API never fabricates a prediction.

## Progress and Notifications

All progress and notification endpoints require a JWT bearer token and use the authenticated subject as the ownership key.

- `GET /api/progress`: user-scoped stats, logs, quizzes, and progress state.
- `PATCH /api/progress/state`: update XP, streak, badges, outfit, and bookmarks.
- `GET /api/notifications`: list notifications with optional `category` and `channel` filters.
- `POST /api/notifications/generate`: evaluate event rules with weather and user context.
- `PATCH /api/notifications/<id>/read`: mark one notification read.
- `PATCH /api/notifications/<id>/dismiss`: dismiss one notification.
- `POST /api/notifications/read-all`: mark all notifications read.
- `GET/PATCH /api/notifications/preferences`: manage enabled state, quiet hours, channels, and category filters.

Notification generation applies user preferences, quiet hours, cooldowns, event-hash deduplication, and daily limits server-side.
