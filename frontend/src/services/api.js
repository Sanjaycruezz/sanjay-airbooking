
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

// Automatically attach the JWT access token to requests

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');

    // Public endpoints do not need authentication
    const publicEndpoints = [
        'accounts/register/',
        'accounts/login/',
        'accounts/token/refresh/',
    ];

    const isPublicEndpoint = publicEndpoints.some(
        (endpoint) => config.url?.includes(endpoint)
    );

    if (token && !isPublicEndpoint) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


export default api;
