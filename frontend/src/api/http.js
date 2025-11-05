import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";
const TOKEN_STORAGE_KEY = "autotrack_token";
export const http = axios.create({
    baseURL: API_BASE_URL,
});
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
    else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
};
http.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
http.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        setAuthToken(null);
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }
    return Promise.reject(error);
});
