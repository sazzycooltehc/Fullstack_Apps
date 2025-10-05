import os
import base64
import json
import re
import tempfile
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
import requests
import spotipy
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# ------------------ Config ------------------
from dotenv import load_dotenv

load_dotenv()

raw_secret = os.getenv("JWT_SECRET_BASE64")

if not raw_secret:
    raise RuntimeError("Missing JWT_SECRET_BASE64 in .env")

try:
    # Java expects Base64 decoding
    SECRET_KEY = base64.b64decode(raw_secret)
except Exception as e:
    raise RuntimeError(f"Invalid Base64 key: {e}")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ------------------ Models ------------------
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class AudioFeatures(BaseModel):
    duration: float
    tempo: float
    key: str
    mode: str
    time_signature: int
    energy: float
    danceability: float
    valence: float
    acousticness: float
    instrumentalness: float
    liveness: float
    speechiness: float
    loudness: float

class SimilarTrack(BaseModel):
    name: str
    artist: str
    album: str
    match: float

class MusicInsights(BaseModel):
    title: str
    artist: str
    album: str
    genre: List[str]
    year: int
    duration: str
    popularity: int
    audio_features: AudioFeatures
    similar_tracks: List[SimilarTrack]

# ------------------ App Setup ------------------
app = FastAPI(title="Music Insights API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# ------------------ Mock User DB ------------------
# ------------------ Mock User DB ------------------
fake_users_db = {
    "user1": {
        "username": "user1",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    },
    "31eqwi2sc5lzx24lc47avgntynpi": {
        "username": "31eqwi2sc5lzx24lc47avgntynpi",
        "hashed_password": "some_dummy_hash", # Not used in this flow, but the model requires it
        "disabled": False,
    }
}
# ------------------ Auth Helpers ------------------
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire_time = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    # Use integer unix timestamp for exp to avoid library differences
    to_encode.update({"exp": int(expire_time.timestamp())})
    # Ensure 'sub' is present in `data` (we pass it when calling)
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    print("🔐 Incoming token:", token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError as e:
        print("❌ JWT decode error:", e)
        raise credentials_exception

    # Look up the user in the database
    user = get_user(fake_users_db, username=username)
    if user is None:
        raise credentials_exception
    
    # Return the full user object, not just the name
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# ------------------ Spotify API Wrapper ------------------
class SpotifyAPI:
    def __init__(self, access_token: str):
        try:
            self.sp = spotipy.Spotify(auth=access_token)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Spotify client init failed: {e}")

    def search_track(self, query: str) -> Optional[dict]:
        results = self.sp.search(q=query, limit=1, type='track')
        if not results['tracks']['items']:
            return None
        return results['tracks']['items'][0]

    def get_insights(self, track_id: str) -> dict:
        try:
            track = self.sp.track(track_id)
            audio_features = self.sp.audio_features(track_id)[0]
            recommendations = self.sp.recommendations(seed_tracks=[track_id], limit=3)['tracks']

            similar_tracks = [
                {
                    'name': rec['name'],
                    'artist': rec['artists'][0]['name'],
                    'album': rec['album']['name'],
                    'match': 0.7 + random.random() * 0.3
                }
                for rec in recommendations
            ]

            return {
                'title': track['name'],
                'artist': track['artists'][0]['name'],
                'album': track['album']['name'],
                'genre': [''],  # Spotify API doesn't provide track genres directly
                'year': int(track['album']['release_date'][:4]) if track['album'].get('release_date') else 0,
                'duration': f"{int(track['duration_ms'] / 1000 // 60)}:{int(track['duration_ms'] / 1000 % 60):02d}",
                'popularity': track['popularity'],
                'audio_features': audio_features,
                'similar_tracks': similar_tracks
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get Spotify insights: {e}")

def fetch_spotify_access_token(app_bearer_token: str) -> str:
    JAVA_AUTH_BASE_URL = os.getenv("JAVA_AUTH_BASE_URL", "http://localhost:8084/api")
    try:
        resp = requests.get(
            f"{JAVA_AUTH_BASE_URL}/auth/spotify/token",
            headers={"Authorization": f"Bearer {app_bearer_token}"},
            timeout=10,
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to obtain Spotify access token")
        data = resp.json()
        token = data.get("access_token")
        if not token:
            raise HTTPException(status_code=401, detail="Spotify token missing in response")
        return token
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Spotify token: {e}")

# ------------------ Endpoints ------------------
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/analyze/upload", response_model=MusicInsights)
async def analyze_uploaded_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    token: str = Depends(oauth2_scheme),
):
    if not file.filename.lower().endswith((".mp3", ".wav", ".ogg", ".flac", ".m4a")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        import librosa
        y, sr = librosa.load(temp_file_path, sr=None)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

        track_name = os.path.splitext(file.filename)[0].replace('_', ' ').title()

        access_token = fetch_spotify_access_token(token)
        spotify = SpotifyAPI(access_token)
        track = spotify.search_track(track_name)

        if not track:
            raise HTTPException(status_code=404, detail=f"No matching track found for '{track_name}' on Spotify.")

        insights_data = spotify.get_insights(track['id'])
        insights_data['audio_features']['tempo'] = float(tempo)
        if not insights_data.get('genre'):
            insights_data['genre'] = ['Pop', 'Rock']

        return MusicInsights(**insights_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass

@app.get("/analyze/search", response_model=List[MusicInsights])
async def search_songs(
    q: str,
    current_user: User = Depends(get_current_active_user),
    token: str = Depends(oauth2_scheme),
):
    access_token = fetch_spotify_access_token(token)
    spotify = SpotifyAPI(access_token)
    results = spotify.sp.search(q=q, limit=3, type='track')['tracks']['items']

    if not results:
        raise HTTPException(status_code=404, detail=f"No tracks found for '{q}'.")

    insights_list = []
    for track in results:
        insights_list.append(MusicInsights(**spotify.get_insights(track['id'])))

    return insights_list

@app.get("/recommendations/{song_id}", response_model=List[SimilarTrack])
async def get_similar_songs(
    song_id: str,
    current_user: User = Depends(get_current_active_user),
    token: str = Depends(oauth2_scheme),
):
    access_token = fetch_spotify_access_token(token)
    spotify = SpotifyAPI(access_token)
    recommendations = spotify.sp.recommendations(seed_tracks=[song_id], limit=3)['tracks']

    similar_tracks = [
        SimilarTrack(
            name=rec['name'],
            artist=rec['artists'][0]['name'],
            album=rec['album']['name'],
            match=0.7 + random.random() * 0.3,
        )
        for rec in recommendations
    ]

    return similar_tracks

@app.get("/analyze/url", response_model=MusicInsights)
async def analyze_from_url(
    url: str,
    current_user: User = Depends(get_current_active_user),
    token: str = Depends(oauth2_scheme),
):
    match = re.search(r"open\.spotify\.com/track/([a-zA-Z0-9]+)", url)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Invalid Spotify track URL. Please provide a URL like: https://open.spotify.com/track/...",
        )
    track_id = match.group(1)

    try:
        access_token = fetch_spotify_access_token(token)
        spotify = SpotifyAPI(access_token)
        insights_data = spotify.get_insights(track_id)
        return MusicInsights(**insights_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred while analyzing the URL: {e}"
        )

@app.get("/")
async def root():
    return {"message": "Music Insights API is running"}
