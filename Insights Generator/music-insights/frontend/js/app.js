// app.js

import apiService from './api.js';

  // --- APPLICATION LOGIC (from app.js) ---
  const loginContainer = document.getElementById('loginContainer');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const logoutBtn = document.getElementById('logoutBtn');
  const spotifyLoginBtn = document.getElementById('spotifyLoginBtn');
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
  const uploadContainer = document.querySelector('.upload-container');

  let currentFile = null;

  // --- Event Listeners ---
  document.addEventListener('DOMContentLoaded', () => {
      const token = localStorage.getItem('authToken');
      if (token) {
          apiService.setToken(token);
          showDashboard();
      }

      if (loginForm) loginForm.addEventListener('submit', handleLogin);
      
      if (spotifyLoginBtn) {
          spotifyLoginBtn.addEventListener('click', () => {
              const w = 520, h = 720;
              const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
              const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
              window.open(
                  `${apiService.authBaseUrl}/auth/spotify/login`,
                  'spotifyLogin',
                  `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
              );
          });
      }

      window.addEventListener('message', (event) => {
          const data = event.data;
          if (data && data.type === 'APP_JWT' && data.token) {
              try {
                  localStorage.setItem('authToken', data.token);
                  apiService.setToken(data.token);
                  showDashboard();
              } catch (e) {
                  console.error('Failed to handle Spotify login token', e);
                  alert('Login failed. Please try again.');
              }
          }
      });

      if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

      tabButtons.forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));

      if (browseBtn && fileInput) {
          browseBtn.addEventListener('click', () => fileInput.click());
          fileInput.addEventListener('change', (e) => {
              if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
          });
      }
       
      if(uploadContainer) {
          ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
              uploadContainer.addEventListener(eventName, preventDefaults, false);
          });
          ['dragenter', 'dragover'].forEach(eventName => {
              uploadContainer.addEventListener(eventName, () => uploadContainer.classList.add('highlight'), false);
          });
          ['dragleave', 'drop'].forEach(eventName => {
              uploadContainer.addEventListener(eventName, () => uploadContainer.classList.remove('highlight'), false);
          });
          uploadContainer.addEventListener('drop', (e) => {
               if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
          }, false);
      }

      if (analyzeBtn) analyzeBtn.addEventListener('click', handleFileUpload);

      if (searchBtn && searchInput) {
          searchBtn.addEventListener('click', handleSearch);
          searchInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') handleSearch();
          });
      }

      if (fetchBtn && urlInput) {
          fetchBtn.addEventListener('click', handleUrlFetch);
          urlInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') handleUrlFetch();
          });
      }
      
      // Activate the first tab by default
      switchTab('upload');
  });

  // --- Helper Functions ---
  function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
  }
  
  function handleFileSelect(file) {
      currentFile = file;
      fileInfo.textContent = `Selected: ${currentFile.name} (${formatFileSize(currentFile.size)})`;
      analyzeBtn.disabled = false;
  }

  function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // --- Authentication Functions ---
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
          const token = resp.token || resp.access_token;
          if (!token) throw new Error('No token received');
          localStorage.setItem('authToken', token);
          apiService.setToken(token);
          showDashboard();
      } catch (error) {
          console.error('Login failed:', error);
          alert(`Login failed: ${error.message}`);
      }
  }

  function handleLogout() {
      localStorage.removeItem('authToken');
      apiService.setToken(null);
      window.location.reload();
  }

  function showDashboard() {
      loginContainer.style.display = 'none';
      dashboard.style.display = 'block';
  }

  // --- Tab Functions ---
  function switchTab(tabName) {
      tabButtons.forEach(button => {
          button.classList.toggle('active', button.dataset.tab === tabName);
      });
      tabContents.forEach(content => {
          content.classList.toggle('hidden', content.id !== `${tabName}Tab`);
      });
      insightsContainer.innerHTML = ''; // Clear previous results
      searchResults.innerHTML = '';
  }

  // --- Analysis Functions ---
  async function handleFileUpload() {
      if (!currentFile) return;
      try {
          showLoading('Analyzing your music file...');
          const data = await apiService.uploadFile(currentFile);
          displayInsights(data);
      } catch (error) {
          console.error('Analysis failed:', error);
          showError(`Analysis failed: ${error.message}`);
      }
  }

  async function handleSearch() {
      const query = searchInput.value.trim();
      if (!query) return;
      try {
          searchResults.innerHTML = '';
          showLoading(`Searching for "${query}"...`);
          const results = await apiService.searchSong(query);
          insightsContainer.innerHTML = ''; // Clear loading
          displaySearchResults(results);
      } catch (error) {
          console.error('Search failed:', error);
          showError(`Search failed: ${error.message}`);
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
          showError(`URL fetch failed: ${error.message}`);
      }
  }

  // --- UI Update Functions ---
  function displaySearchResults(results) {
      searchResults.innerHTML = '';
      if (!results || results.length === 0) {
          searchResults.innerHTML = '<p class="text-center text-gray-400">No results found. Try a different search term.</p>';
          return;
      }
      results.forEach(insights => {
          const resultItem = document.createElement('div');
          resultItem.className = 'bg-gray-700 p-3 rounded-md mb-2 flex justify-between items-center hover:bg-gray-600 transition';
          resultItem.innerHTML = `
              <div>
                  <p class="font-bold">${insights.title}</p>
                  <p class="text-sm text-gray-400">${insights.artist || 'Unknown Artist'} &bull; ${insights.album || 'Unknown Album'}</p>
              </div>
              <button class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded-md">View Insights</button>
          `;
          resultItem.querySelector('button').addEventListener('click', () => {
              displayInsights(insights);
          });
          searchResults.appendChild(resultItem);
      });
  }

  function displayInsights(raw) {
      const data = {
          title: raw.title || raw.name || 'Unknown',
          artist: raw.artist || (raw.artists && raw.artists[0]) || 'Unknown Artist',
          album: raw.album || raw.album_name || 'Unknown Album',
          genre: raw.genre || raw.genres || [],
          year: raw.year || raw.release_year || null,
          duration: raw.duration || raw.duration_formatted || 'N/A',
          popularity: raw.popularity,
          audioFeatures: raw.audioFeatures || raw.audio_features || {},
          similarTracks: raw.similarTracks || raw.similar_tracks || [],
      };

      const renderProgressBar = (label, value) => {
          const percentage = Math.round((value || 0) * 100);
          return `
              <div class="flex items-center gap-4 text-sm">
                  <label class="w-28 font-medium text-gray-300">${label}</label>
                  <div class="flex-grow bg-gray-600 rounded-full h-2"><div class="bg-green-500 h-2 rounded-full" style="width: ${percentage}%"></div></div>
                  <span class="w-10 text-right text-gray-400">${percentage}%</span>
              </div>
          `;
      };

      insightsContainer.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Left Column: Main Details & Audio Features -->
              <div class="lg:col-span-2 space-y-6">
                  <div class="bg-gray-900/50 p-6 rounded-lg fade-in">
                      <h3 class="text-2xl font-bold mb-1">${data.title}</h3>
                      <p class="text-lg text-gray-300 mb-4">${data.artist}</p>
                      <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                          <p><strong>Album:</strong> ${data.album}</p>
                          <p><strong>Year:</strong> ${data.year || 'N/A'}</p>
                          <p><strong>Duration:</strong> ${data.duration}</p>
                          <p><strong>Genre:</strong> ${Array.isArray(data.genre) ? data.genre.join(', ') : data.genre || 'N/A'}</p>
                          <p><strong>Key:</strong> ${data.audioFeatures.key || 'N/A'} ${((data.audioFeatures.mode === 1) || (data.audioFeatures.mode === 'major')) ? 'Major' : 'Minor'}</p>
                          <p><strong>Tempo:</strong> ${Math.round(data.audioFeatures.tempo || 0)} BPM</p>
                      </div>
                  </div>
                  <div class="bg-gray-900/50 p-6 rounded-lg fade-in" style="animation-delay: 0.1s">
                      <h3 class="text-xl font-bold mb-4">Audio Features</h3>
                      <div class="space-y-3">
                          ${renderProgressBar('Danceability', data.audioFeatures.danceability)}
                          ${renderProgressBar('Energy', data.audioFeatures.energy)}
                          ${renderProgressBar('Valence (Positivity)', data.audioFeatures.valence)}
                          ${renderProgressBar('Acousticness', data.audioFeatures.acousticness)}
                          ${renderProgressBar('Instrumentalness', data.audioFeatures.instrumentalness)}
                          ${renderProgressBar('Liveness', data.audioFeatures.liveness)}
                          ${renderProgressBar('Speechiness', data.audioFeatures.speechiness)}
                      </div>
                  </div>
              </div>
              <!-- Right Column: Similar Tracks -->
              <div class="bg-gray-900/50 p-6 rounded-lg fade-in" style="animation-delay: 0.2s">
                  <h3 class="text-xl font-bold mb-4">Similar Tracks</h3>
                  <div class="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                      ${!data.similarTracks || data.similarTracks.length === 0 
                          ? '<p class="text-gray-400">No similar tracks found.</p>' 
                          : data.similarTracks.map(track => `
                          <div class="bg-gray-700 p-3 rounded-md">
                              <div class="flex justify-between items-center">
                                  <div>
                                      <p class="font-semibold text-sm">${track.name || track.title}</p>
                                      <p class="text-xs text-gray-400">${track.artist || (track.artists && track.artists[0])}</p>
                                  </div>
                                  <span class="text-sm font-bold text-green-400">${Math.round((track.match || track.similarity || 0) * 100)}%</span>
                              </div>
                          </div>
                      `).join('')}
                  </div>
              </div>
          </div>
      `;
      insightsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showLoading(message) {
      insightsContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <div class="w-8 h-8 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin mb-4" style="animation: spin 1s linear infinite;"></div>
              <p>${message}</p>
          </div>
      `;
  }

  function showError(message) {
      insightsContainer.innerHTML = `
          <div class="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg text-center">
              <p>❌ ${message}</p>
          </div>
      `;
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