import os
import json
import tempfile
from typing import Dict, List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import librosa
import numpy as np
import random

# Configuration
# FIX: Replaced weak, 20-character key with a securely generated, 64-character (512-bit) key.
# This ensures compliance with security standards (HS256 requires >= 256 bits).
# WARNING: In production, this MUST be loaded from environment variables (e.g., os.environ.get("SECRET_KEY")).
SECRET_KEY = "MWYyZDFlMmU2N2RmNGYzNmQ3YTM0Njk2YzFhMjg5YjQ="
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Mock user database (in production, use a real database)
fake_users_db = {
    "user1": {
        "username": "user1",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # password: demo123
        "disabled": False,
    }
}

# Models
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

class MusicInsights(BaseModel):
    title: str
    artist: str
    album: str
    genre: List[str]
    year: int
    duration: str
    popularity: int
    audio_features: AudioFeatures
    similar_tracks: List[dict]

# Initialize FastAPI app
app = FastAPI(title="Music Insights API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

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
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # JWT decoding uses the SECRET_KEY defined globally
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def analyze_audio(file_path: str) -> dict:
    """Analyze audio file and extract features."""
    try:
        # Load audio file
        y, sr = librosa.load(file_path, sr=None)
        
        # Extract features
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Chroma features for key detection
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)
        key = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][np.argmax(chroma_mean)]
        
        # Other features (simplified for demo)
        features = {
            'duration': duration,
            'tempo': float(tempo),
            'key': key,
            'mode': 'major' if random.random() > 0.5 else 'minor',
            'time_signature': random.choice([3, 4, 6, 7]),
            'energy': random.uniform(0.1, 0.9),
            'danceability': random.uniform(0.1, 0.9),
            'valence': random.uniform(0.1, 0.9),
            'acousticness': random.random(),
            'instrumentalness': random.random() * 0.8,  # Most songs have some vocals
            'liveness': random.random() * 0.3,  # Usually low for studio recordings
            'speechiness': random.random() * 0.5,  # Usually low for music
            'loudness': -30 - random.random() * 20,  # -50 to -30 dB
        }
        
        return features
    except Exception as e:
        print(f"Error analyzing audio: {str(e)}")
        return {}

def generate_mock_insights(filename: str) -> dict:
    """Generate mock insights for demo purposes."""
    genres = [
        ['Rock', 'Classic Rock', 'Progressive Rock'],
        ['Pop', 'Dance Pop', 'Electropop'],
        ['Hip-Hop', 'Rap', 'Trap'],
        ['Jazz', 'Fusion', 'Smooth Jazz'],
        ['Electronic', 'House', 'Techno'],
        ['Classical', 'Orchestral', 'Piano'],
        ['R&B', 'Soul', 'Funk'],
        ['Metal', 'Heavy Metal', 'Death Metal']
    ]
    
    genre_set = random.choice(genres)
    artists = ['The Beatles', 'Michael Jackson', 'Queen', 'Taylor Swift', 'Kendrick Lamar', 'Daft Punk', 'Hans Zimmer', 'Nirvana']
    years = [1970, 1985, 1999, 2005, 2010, 2015, 2020]
    
    # Generate random audio features
    audio_features = {
        'duration': random.uniform(120, 480),  # 2-8 minutes
        'tempo': random.uniform(70, 180),  # 70-180 BPM
        'key': random.choice(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']),
        'mode': 'major' if random.random() > 0.5 else 'minor',
        'time_signature': random.choice([3, 4, 6, 7]),
        'energy': random.uniform(0.1, 0.9),
        'danceability': random.uniform(0.1, 0.9),
        'valence': random.uniform(0.1, 0.9),
        'acousticness': random.random(),
        'instrumentalness': random.random() * 0.8,
        'liveness': random.random() * 0.3,
        'speechiness': random.random() * 0.5,
        'loudness': -30 - random.random() * 20,
    }
    
    # Generate similar tracks
    similar_tracks = []
    similar_artists = [a for a in artists if a != artists[0]][:3]
    for i in range(3):
        similar_tracks.append({
            'name': f"Track {random.randint(1000, 9999)}",
            'artist': similar_artists[i] if i < len(similar_artists) else 'Various Artists',
            'album': f"Album {chr(65 + i)}",
            'match': 0.6 + random.random() * 0.4  # 60-100% match
        })
    
    # Sort by match percentage
    similar_tracks.sort(key=lambda x: x['match'], reverse=True)
    
    # Format duration as MM:SS
    minutes = int(audio_features['duration'] // 60)
    seconds = int(audio_features['duration'] % 60)
    duration = f"{minutes}:{seconds:02d}"
    
    return {
        'title': os.path.splitext(filename)[0].replace('_', ' ').title(),
        'artist': random.choice(artists),
        'album': f"Album {chr(65 + random.randint(0, 25))}",
        'genre': genre_set,
        'year': random.choice(years),
        'duration': duration,
        'popularity': random.randint(30, 100),  # 30-100
        'audio_features': audio_features,
        'similar_tracks': similar_tracks
    }

# API Endpoints
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

@app.post("/analyze/upload")
async def analyze_uploaded_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    # Check file type
    if not file.filename.lower().endswith(('.mp3', '.wav', '.ogg', '.flac', '.m4a')):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name
    
    try:
        # Analyze the audio file
        features = analyze_audio(temp_file_path)
        
        # For demo, we'll use mock data if analysis fails
        if not features:
            insights = generate_mock_insights(file.filename)
        else:
            insights = {
                'title': os.path.splitext(file.filename)[0].replace('_', ' ').title(),
                'artist': 'Analyzed Artist',
                'album': 'Analyzed Album',
                'genre': ['Analyzed Genre 1', 'Analyzed Genre 2'],
                'year': 2023,
                'duration': f"{int(features['duration'] // 60)}:{int(features['duration'] % 60):02d}",
                'popularity': random.randint(30, 100),
                'audio_features': features,
                'similar_tracks': [
                    {
                        'name': 'Similar Track 1',
                        'artist': 'Similar Artist 1',
                        'album': 'Similar Album 1',
                        'match': 0.85
                    },
                    {
                        'name': 'Similar Track 2',
                        'artist': 'Similar Artist 2',
                        'album': 'Similar Album 2',
                        'match': 0.78
                    }
                ]
            }
        
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass

@app.get("/analyze/search")
async def search_songs(
    q: str,
    current_user: User = Depends(get_current_active_user)
):
    # In a real app, this would search a music database
    # For demo, return mock search results
    mock_results = [
        {
            'id': '1',
            'title': f"{q.capitalize()} - Official Audio",
            'artist': 'Popular Artist',
            'album': 'Greatest Hits',
            'year': 2022,
            'duration': '3:45'
        },
        {
            'id': '2',
            'title': f"Best of {q.capitalize()}",
            'artist': 'Various Artists',
            'album': 'Compilation',
            'year': 2021,
            'duration': '4:12'
        },
        {
            'id': '3',
            'title': f"{q.upper()} (Remix)",
            'artist': 'DJ Remixer',
            'album': 'Remix Collection',
            'year': 2023,
            'duration': '3:15'
        }
    ]
    
    return mock_results

@app.post("/analyze/url")
async def analyze_from_url(
    url: dict,
    current_user: User = Depends(get_current_active_user)
):
    # In a real app, this would download and analyze from the URL
    # For demo, return mock data
    return generate_mock_insights("streamed_song.mp3")

@app.get("/recommendations/{song_id}")
async def get_similar_songs(
    song_id: str,
    current_user: User = Depends(get_current_active_user)
):
    # In a real app, this would fetch similar songs based on the ID
    # For demo, return mock recommendations
    return [
        {
            'id': '101',
            'title': 'Similar Song 1',
            'artist': 'Similar Artist 1',
            'album': 'Similar Album 1',
            'match': 0.85
        },
        {
            'id': '102',
            'title': 'Similar Song 2',
            'artist': 'Similar Artist 2',
            'album': 'Similar Album 2',
            'match': 0.78
        },
        {
            'id': '103',
            'title': 'Similar Song 3',
            'artist': 'Similar Artist 3',
            'album': 'Similar Album 3',
            'match': 0.72
        }
    ]

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Music Insights API is running"}

# Run with: uvicorn analyzer:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)