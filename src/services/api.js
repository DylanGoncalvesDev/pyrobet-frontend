import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        Accept: 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pyrobet_token');
    const publicEndpoints = ['/login', '/register'];

    if (token && !publicEndpoints.includes(config.url)) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;