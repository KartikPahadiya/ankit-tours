import axios from "axios";

const api = axios.create({
  // In development: uses http://127.0.0.1:8000
  // In production (Vercel): uses the VITE_API_URL environment variable
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
