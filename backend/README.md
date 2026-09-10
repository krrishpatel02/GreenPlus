# GreenPlus Backend

## Structure

- `app.py`: Flask application factory and server entry point.
- `config.py`: environment-backed configuration.
- `database/`: shared MongoDB client and database boundary.
- `routes/`: HTTP endpoints grouped by feature.
- `http.py`: shared JSON parsing and route error handling.
- `services/`: prediction and authentication business logic.
- `services/container.py`: cached service factories; services are created on first use.
- `services/model_loader.py`: lazy ML artifact loading and availability reporting.
- `services/energy_engine.py`: isolated deterministic energy-analysis adapter.
- `repositories/`: MongoDB persistence operations.

Prediction services and models are loaded lazily by the first prediction request. Health and authentication requests do not load the ML artifacts.

## Run

From the repository root with the project environment active:

```powershell
.\.venv1\Scripts\python.exe -m backend.app
```

MongoDB must be running locally at `mongodb://127.0.0.1:27017`, or set `MONGO_URI`.
The frontend can override the API host with `VITE_API_URL`.
