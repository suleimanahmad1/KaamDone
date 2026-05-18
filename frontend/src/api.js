import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const hadToken = Boolean(error.config?.headers?.Authorization);

    if (
      status === 401 &&
      hadToken &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/register")
    ) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export function getFieldErrors(error) {
  const list = error.response?.data?.errors;
  if (!Array.isArray(list)) return {};
  return list.reduce((acc, item) => {
    if (item.field) acc[item.field] = item.message;
    return acc;
  }, {});
}

export function getApiErrorMessage(error) {
  if (error.response?.status === 401) {
    return error.response?.data?.message || "Please login again";
  }
  if (error.response?.status === 502) {
    return "Backend offline. Run: cd server → npm run dev";
  }
  if (!error.response) {
    return "Cannot reach API. Start backend: cd server → npm run dev";
  }
  return error.response?.data?.message || error.message || "Something went wrong";
}

export default api;
