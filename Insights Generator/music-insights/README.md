# Music Insights (Vanilla SPA + Java + Python)

A single-page application to generate insights from songs/music (genre, popularity, artist, audio features) with three input methods:
- Upload an audio file
- Search by song name
- Analyze via URL

Tech stack (no frameworks on the frontend):
- Frontend: HTML + CSS + Vanilla JavaScript
- Backend (functional): Java 11, Jersey (Grizzly server)
- Analytics: Python FastAPI

## Project Structure
```
music-insights/
├── analytics/              # Python analytics API
│   ├── analyzer.py
│   └── requirements.txt
├── backend/                # Java REST API (Grizzly + Jersey)
│   ├── pom.xml
│   └── src/main/java/com/musicinsights/
│       ├── Main.java
│       ├── config/
│       │   ├── ApplicationBinder.java
│       │   └── ApplicationConfig.java
│       ├── filter/
│       │   ├── AuthenticationFilter.java
│       │   └── CorsFilter.java
│       ├── model/
│       │   ├── AuthResponse.java
│       │   ├── LoginRequest.java
│       │   └── UserPrincipal.java
│       ├── resource/
│       │   ├── AuthResource.java
│       │   └── MusicResource.java
│       └── service/
│           ├── AnalysisService.java
│           ├── MusicService.java
│           └── impl/
│               ├── AnalysisServiceImpl.java
│               ├── AuthenticationServiceImpl.java
│               └── MusicServiceImpl.java
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── api.js
        └── app.js
```

> Note: There is an older duplicate backend at `../backend/` in the repository root. To avoid confusion, keep using the `music-insights/` tree. See Archive section below for optional cleanup commands.

## Prerequisites
- Java 11+
- Maven 3.6+
- Python 3.9+
- pip

## Run Instructions

### 1) Start Python Analytics API (port 8000)
```
cd music-insights/analytics
pip install -r requirements.txt
uvicorn analyzer:app --reload --host 0.0.0.0 --port 8000
```
Endpoints (auth protected):
- POST /token
- POST /analyze/upload
- GET  /analyze/search?q=...
- POST /analyze/url
- GET  /recommendations/{song_id}

Demo user: user1 / demo123 (configured inside `analyzer.py`)

### 2) Start Java Backend (port 8084)
```
cd music-insights/backend
mvn clean package -DskipTests
mvn exec:java -Dexec.mainClass="com.musicinsights.Main"
```
Base URL: http://localhost:8084/api

Endpoints:
- POST /api/auth/login             -> returns JWT
- GET  /api/analyze/search?q=...
- POST /api/analyze/url            -> analyze via URL
- POST /api/analyze/upload         -> multipart file upload
- GET  /api/analyze/track/{id}     -> track metadata (mock)
- GET  /api/analyze/track/{id}/analyze -> full analysis (mock)
- GET  /api/analyze/similar/{id}   -> similar tracks (mock)

### 3) Open Frontend
Open `music-insights/frontend/index.html` in a modern browser.
- Login with demo credentials (Java backend accepts e.g., `user/user123`, `demo/demo123`).
- Use Upload, Search, or URL tabs.

If the browser blocks module imports via `file://`, serve the frontend with a tiny static server:
```
# Option A (Python)
cd music-insights/frontend
python -m http.server 5500
# then open http://localhost:5500
```

## How It Works
- Frontend calls Java backend at `http://localhost:8084/api`.
- Java backend forwards to Python analytics for search/URL analysis where applicable, or returns mock data (for offline/demo paths).
- CORS is enabled via `CorsFilter`.
- JWT auth is required for non-public routes; public: `/api/auth/login`.

## Configuration
`music-insights/backend/src/main/resources/application.properties`
- `python.service.url=http://localhost:8000`
- `jwt.secret=MWYyZDFlMmU2N2RmNGYzNmQ3YTM0Njk2YzFhMjg5YjQ=`

## Archive Old Duplicates (Optional)
If you want to archive the older root-level `backend/` and `frontend/` to avoid confusion, you can move them into an `archive/` folder at the repo root.

PowerShell (Windows):
```
New-Item -ItemType Directory -Force -Path archive | Out-Null
Move-Item -Path ../backend -Destination ./archive/backend-old -Force
Move-Item -Path ../frontend -Destination ./archive/frontend-old -Force
```

This keeps all active development under `music-insights/`.

## Notes
- The Python analytics uses `librosa` which can be a heavy install. The Java layer will gracefully fallback to mock data if analytics is unavailable.
- No frontend frameworks are used; everything is vanilla and easy to run.
