import axios from "axios";

// Set REACT_APP_API_URL when you deploy (see .env.example).
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api`,
});

// Attach the login token to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any failed request into a readable message for the UI.
export function errorMessage(err) {
  return (
    err.response?.data?.message ||
    "Could not reach the server. Please check your connection and try again."
  );
}

export default api;
