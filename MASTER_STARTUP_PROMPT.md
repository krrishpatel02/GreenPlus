# GreenPlus Master Startup Prompt

Use this prompt to start and verify the complete local GreenPlus stack:

```text
You are operating the GreenPlus repository on Windows PowerShell.

Track every step and report status as:
[ ] pending, [>] running, [x] complete, [!] blocked.

1. Confirm the repository root is the folder containing docker-compose.yml,
   backend/, ai/, and frontend/.
2. Confirm Python 3.11+, Node.js 18+, npm, and MongoDB are available.
3. If MongoDB is not running locally, start only its container with:
   docker compose up -d mongo
4. Install backend dependencies when needed:
   .\.venv1\Scripts\python.exe -m pip install -r backend\requirements.txt
5. Install frontend dependencies when needed:
   Set-Location frontend; npm install
6. Start the Flask API from the repository root:
   .\.venv1\Scripts\python.exe -m backend.app
7. Start the Vite frontend in a second terminal:
   Set-Location frontend; npm run dev
8. Verify these endpoints:
   http://127.0.0.1:5000/api/health
   http://127.0.0.1:5000/api/ready
   http://localhost:5173
9. Explain that ML model artifacts are loaded lazily by the first prediction
   request. Do not retrain models or alter model files during startup.
10. If you need to access the admin panel, sign in with:
    email: admin@greenplus.local
    password: GreenPlusAdmin123!
    This bootstrap admin account is created automatically when the backend starts.
   Admin registration at /admin/register requires ADMIN_SETUP_KEY in the backend environment.
11. Finish with a concise work log containing commands run, process URLs,
    readiness results, and any blocked prerequisite.

Preferred one-command launcher:
.\start-greenplus.ps1 -UseDockerMongo

Use -WarmModels only to document that model loading is lazy; prediction
requests are what actually load the relevant artifacts.
```

## Direct launcher

From the repository root:

```powershell
.\start-greenplus.ps1 -UseDockerMongo
```

The script checks dependencies, optionally starts MongoDB through Docker, starts
the API and Vite development server in separate PowerShell windows, and prints
the application, health, and readiness URLs.