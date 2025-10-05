// api.js

// --- API SERVICE (from api.js) ---
class ApiService {
    constructor() {
        this.authBaseUrl = 'http://localhost:8084/api';
        this.insightsBaseUrl = 'http://127.0.0.1:8000';
        this.token = null;
    }

    setToken(token) {
        this.token = token;
    }

    async request(baseUrl, endpoint, options = {}) {
        const headers = {
            'Accept': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = options.headers?.['Content-Type'] || 'application/json';
        }

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                throw new Error(errorData.message || errorData.detail || 'Something went wrong');
            }

            if (response.status === 204) {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(credentials) {
        return this.request(this.authBaseUrl, '/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    loginWithSpotify() {
        window.location.href = `${this.authBaseUrl}/auth/spotify/login`;
    }

    // Music analysis endpoints
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.request(this.insightsBaseUrl, '/analyze/upload', {
            method: 'POST',
            body: formData,
        });
    }

    async searchSong(query) {
        return this.request(this.insightsBaseUrl, `/analyze/search?q=${encodeURIComponent(query)}`);
    }

    async analyzeUrl(url) {
        return this.request(this.insightsBaseUrl, `/analyze/url?url=${encodeURIComponent(url)}`);
    }
}

const apiService = new ApiService();
export default apiService;