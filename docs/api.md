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
- `POST /api/analyze/energy`: deterministic household energy, bill, solar, and appliance analysis.

ML models are loaded lazily on the first prediction request. Missing models return `503`; the API never fabricates a prediction.
