import apiService from './api.js';

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const logoutBtn = document.getElementById('logoutBtn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const fileInfo = document.getElementById('fileInfo');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const urlInput = document.getElementById('urlInput');
const fetchBtn = document.getElementById('fetchBtn');
const insightsContainer = document.getElementById('insights');

// Global state
let currentFile = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        apiService.setToken(token);
        showDashboard();
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // File upload handling
    if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                currentFile = e.target.files[0];
                fileInfo.textContent = `Selected: ${currentFile.name} (${formatFileSize(currentFile.size)})`;
                analyzeBtn.disabled = false;
            }
        });

        // Drag and drop
        const uploadContainer = document.querySelector('.upload-container');
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, unhighlight, false);
        });

        uploadContainer.addEventListener('drop', handleDrop, false);
    }

    // Analyze button
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleFileUpload);
    }

    // Search functionality
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    // URL fetch
    if (fetchBtn && urlInput) {
        fetchBtn.addEventListener('click', handleUrlFetch);
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUrlFetch();
        });
    }
});

// Helper Functions
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    document.querySelector('.upload-container').classList.add('highlight');
}

function unhighlight() {
    document.querySelector('.upload-container').classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        currentFile = files[0];
        fileInfo.textContent = `Selected: ${currentFile.name} (${formatFileSize(currentFile.size)})`;
        analyzeBtn.disabled = false;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    try {
        const resp = await apiService.login({ username, password });
        const token = resp.token || resp.access_token; // Java backend returns token
        if (!token) throw new Error('No token received');
        localStorage.setItem('authToken', token);
        apiService.setToken(token);
        showDashboard();
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    window.location.reload();
}

function showDashboard() {
    loginContainer.style.display = 'none';
    dashboard.style.display = 'block';
}

// Tab Functions
function switchTab(tabName) {
    // Update active tab button
    tabButtons.forEach(button => {
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Show corresponding tab content
    tabContents.forEach(content => {
        if (content.id === `${tabName}Tab`) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });

    // Clear any previous results
    insightsContainer.innerHTML = '';
}

// Analysis Functions
async function handleFileUpload() {
    if (!currentFile) return;

    try {
        showLoading('Analyzing your music file...');
        const data = await apiService.uploadFile(currentFile);
        displayInsights(data);
    } catch (error) {
        console.error('Analysis failed:', error);
        showError('Failed to analyze the file. Please try again.');
    }
}

async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        showLoading(`Searching for "${query}"...`);
        const response = await apiService.searchSong(query);
        const results = response.results || response; // backend wraps as {results: [...]}
        displaySearchResults(results);
    } catch (error) {
        console.error('Search failed:', error);
        showError('Failed to search for songs. Please try again.');
    }
}

async function handleUrlFetch() {
    const url = urlInput.value.trim();
    if (!url) return;

    try {
        showLoading('Fetching music from URL...');
        const data = await apiService.analyzeUrl(url);
        displayInsights(data);
    } catch (error) {
        console.error('URL fetch failed:', error);
        showError('Failed to fetch from URL. Please check the link and try again.');
    }
}

// UI Update Functions
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No results found. Try a different search term.</p>';
        return;
    }

    const resultsList = document.createElement('div');
    resultsList.className = 'results-list';

    results.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'result-item';
        songElement.innerHTML = `
            <div class="song-info">
                <h4>${song.title}</h4>
                <p>${song.artist} • ${song.album} • ${song.year}</p>
            </div>
            <div class="song-duration">${song.duration}</div>
            <button class="analyze-song" data-id="${song.id}">Analyze</button>
        `;
        
        songElement.querySelector('.analyze-song').addEventListener('click', () => {
            analyzeSong(song.id);
        });
        
        resultsList.appendChild(songElement);
    });

    searchResults.appendChild(resultsList);
}

async function analyzeSong(songId) {
    try {
        showLoading('Analyzing song...');
        
        // In a real app, this would be an actual API call
        // For demo purposes, we'll simulate a response
        const data = await apiService.analyzeById(songId);
        displayInsights(data);
    } catch (error) {
        console.error('Song analysis failed:', error);
        showError('Failed to analyze the song. Please try again.');
    }
}

function displayInsights(raw) {
    // Normalize potential Python-style keys to frontend expectations
    const data = {
        title: raw.title || raw.name || 'Unknown',
        artist: raw.artist || (raw.artists && raw.artists[0]) || 'Unknown Artist',
        album: raw.album || raw.album_name || 'Unknown Album',
        genre: raw.genre || raw.genres || [],
        year: raw.year || raw.release_year || null,
        duration: raw.duration || raw.duration_formatted || 'N/A',
        popularity: raw.popularity || 0,
        audioFeatures: raw.audioFeatures || raw.audio_features || {},
        similarTracks: raw.similarTracks || raw.similar_tracks || [],
    };

    insightsContainer.innerHTML = `
        <div class="insight-card fade-in">
            <h3>${data.title}</h3>
            <div class="insight-details">
                <p><strong>Artist:</strong> ${data.artist}</p>
                <p><strong>Genre:</strong> ${data.genre.join(', ')}</p>
                <p><strong>Year:</strong> ${data.year || 'N/A'}</p>
                <p><strong>Duration:</strong> ${data.duration}</p>
                <p><strong>Popularity:</strong> ${data.popularity}/100</p>
                <p><strong>Key:</strong> ${data.audioFeatures.key || 'N/A'} ${((data.audioFeatures.mode===1)|| (data.audioFeatures.mode==='major')) ? 'Major' : 'Minor'}</p>
                <p><strong>Tempo:</strong> ${Math.round((data.audioFeatures.tempo||0))} BPM</p>
                <p><strong>Energy:</strong> ${Math.round((data.audioFeatures.energy||0) * 100)}%</p>
                <p><strong>Danceability:</strong> ${Math.round((data.audioFeatures.danceability||0) * 100)}%</p>
                <p><strong>Valence:</strong> ${Math.round((data.audioFeatures.valence||0) * 100)}%</p>
            </div>
        </div>
        
        <div class="insight-card fade-in" style="animation-delay: 0.1s">
            <h3>Audio Features</h3>
            <div class="audio-features">
                <div class="feature-bar">
                    <label>Acousticness</label>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(data.audioFeatures.acousticness||0) * 100}%"></div>
                    </div>
                    <span>${Math.round((data.audioFeatures.acousticness||0) * 100)}%</span>
                </div>
                <div class="feature-bar">
                    <label>Instrumentalness</label>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(data.audioFeatures.instrumentalness||0) * 100}%"></div>
                    </div>
                    <span>${Math.round((data.audioFeatures.instrumentalness||0) * 100)}%</span>
                </div>
                <div class="feature-bar">
                    <label>Liveness</label>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(data.audioFeatures.liveness||0) * 100}%"></div>
                    </div>
                    <span>${Math.round((data.audioFeatures.liveness||0) * 100)}%</span>
                </div>
                <div class="feature-bar">
                    <label>Speechiness</label>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(data.audioFeatures.speechiness||0) * 100}%"></div>
                    </div>
                    <span>${Math.round((data.audioFeatures.speechiness||0) * 100)}%</span>
                </div>
            </div>
        </div>
        
        <div class="insight-card fade-in" style="animation-delay: 0.2s">
            <h3>Similar Tracks</h3>
            <div class="similar-tracks">
                ${data.similarTracks.map(track => `
                    <div class="track">
                        <div class="track-info">
                            <h4>${track.name || track.title}</h4>
                            <p>${track.artist || (track.artists && track.artists[0])} • ${track.album || track.album_name}</p>
                        </div>
                        <span class="track-match">${Math.round(((track.match||track.similarity||0) * 100))}% match</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Scroll to insights
    insightsContainer.scrollIntoView({ behavior: 'smooth' });
}

function showLoading(message) {
    insightsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

function showError(message) {
    insightsContainer.innerHTML = `
        <div class="error-message">
            <p>❌ ${message}</p>
        </div>
    `;
}

// Mock Data Generation
function generateMockAnalysis(filename) {
    const genres = [
        ['Rock', 'Classic Rock', 'Progressive Rock'],
        ['Pop', 'Dance Pop', 'Electropop'],
        ['Hip-Hop', 'Rap', 'Trap'],
        ['Jazz', 'Fusion', 'Smooth Jazz'],
        ['Electronic', 'House', 'Techno'],
        ['Classical', 'Orchestral', 'Piano'],
        ['R&B', 'Soul', 'Funk'],
        ['Metal', 'Heavy Metal', 'Death Metal']
    ];
    
    const genreSet = genres[Math.floor(Math.random() * genres.length)];
    const artists = ['The Beatles', 'Michael Jackson', 'Queen', 'Taylor Swift', 'Kendrick Lamar', 'Daft Punk', 'Hans Zimmer', 'Nirvana'];
    const years = [1970, 1985, 1999, 2005, 2010, 2015, 2020];
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const audioFeatures = {
        key: keys[Math.floor(Math.random() * keys.length)],
        mode: Math.round(Math.random()),
        tempo: 80 + Math.random() * 100, // 80-180 BPM
        time_signature: Math.floor(3 + Math.random() * 5), // 3/4 to 7/4
        duration_ms: (180 + Math.random() * 300) * 1000, // 3-8 minutes
        energy: 0.1 + Math.random() * 0.9,
        danceability: 0.1 + Math.random() * 0.9,
        valence: 0.1 + Math.random() * 0.9,
        acousticness: Math.random(),
        instrumentalness: Math.random() * 0.8, // Most songs have some vocals
        liveness: Math.random() * 0.3, // Usually low for studio recordings
        speechiness: Math.random() * 0.5, // Usually low for music
        loudness: -30 - Math.random() * 20, // -50 to -30 dB
    };
    
    const similarTracks = [];
    const similarArtists = [...artists].filter(a => a !== artists[0]).slice(0, 3);
    
    for (let i = 0; i < 3; i++) {
        similarTracks.push({
            name: `Track ${Math.floor(1000 + Math.random() * 9000)}`,
            artist: similarArtists[i] || 'Various Artists',
            album: `Album ${String.fromCharCode(65 + i)}`,
            match: 0.6 + Math.random() * 0.4 // 60-100% match
        });
    }
    
    // Sort by match percentage
    similarTracks.sort((a, b) => b.match - a.match);
    
    // Format duration as MM:SS
    const durationMs = audioFeatures.duration_ms;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    const duration = `${minutes}:${seconds.padStart(2, '0')}`;
    
    return {
        title: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        artist: artists[Math.floor(Math.random() * artists.length)],
        album: `Album ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        genre: genreSet,
        year: years[Math.floor(Math.random() * years.length)],
        duration: duration,
        popularity: Math.floor(30 + Math.random() * 70), // 30-100
        audioFeatures: audioFeatures,
        similarTracks: similarTracks
    };
}

// Add some CSS for the loading spinner and progress bars
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: var(--primary-color);
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 1rem;
    }
    
    .error-message {
        color: var(--error-color);
        text-align: center;
        padding: 1rem;
        background-color: #ffebee;
        border-radius: 5px;
        margin: 1rem 0;
    }
    
    .result-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.2s;
    }
    
    .result-item:hover {
        background-color: var(--light-gray);
    }
    
    .song-info {
        flex: 1;
    }
    
    .song-info h4 {
        margin: 0 0 0.25rem 0;
        color: var(--text-color);
    }
    
    .song-info p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
    }
    
    .song-duration {
        margin: 0 1.5rem;
        color: #666;
    }
    
    .analyze-song {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .analyze-song:hover {
        background-color: #3a5bd9;
    }
    
    .audio-features {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .feature-bar {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .feature-bar label {
        width: 120px;
        font-weight: 500;
    }
    
    .progress-bar {
        flex: 1;
        height: 8px;
        background-color: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .progress {
        height: 100%;
        background-color: var(--primary-color);
        border-radius: 4px;
    }
    
    .similar-tracks {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .track {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background-color: var(--light-gray);
        border-radius: 5px;
    }
    
    .track-info h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
    }
    
    .track-info p {
        margin: 0;
        font-size: 0.85rem;
        color: #666;
    }
    
    .track-match {
        font-weight: 600;
        color: var(--primary-color);
    }
    
    .highlight {
        border: 2px dashed var(--primary-color) !important;
        background-color: rgba(74, 107, 255, 0.05) !important;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
`;

document.head.appendChild(style);
