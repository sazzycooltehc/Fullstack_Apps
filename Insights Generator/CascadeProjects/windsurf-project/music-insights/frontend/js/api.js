class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:8084/api';
        this.token = null;
    }

    setToken(token) {
        this.token = token;
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Something went wrong');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    // Music analysis endpoints
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}/analyze/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'File upload failed');
        }

        return await response.json();
    }

    async searchSong(query) {
        return this.request(`/analyze/search?q=${encodeURIComponent(query)}`);
    }

    async analyzeUrl(url) {
        return this.request('/analyze/url', {
            method: 'POST',
            body: JSON.stringify({ url }),
        });
    }

    async getSimilarSongs(songId) {
        return this.request(`/analyze/similar/${songId}`);
    }

    async analyzeById(songId) {
        return this.request(`/analyze/track/${encodeURIComponent(songId)}/analyze`);
    }
}

const apiService = new ApiService();
export default apiService;
