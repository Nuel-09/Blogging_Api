import axios from "axios";

// Get the backend URL from environment or use default
const API_URL =
  import.meta.env.VITE_API_URL || "https://todo-mnagementapp.onrender.com";

// JWT PATCH: Store token in memory (or use localStorage for persistence)
let jwtToken: string | null = localStorage.getItem("jwtToken");
export function setJwtToken(token: string) {
  jwtToken = token;
  localStorage.setItem("jwtToken", token);
}
export function clearJwtToken() {
  jwtToken = null;
  localStorage.removeItem("jwtToken");
}
export function getJwtToken() {
  return jwtToken || localStorage.getItem("jwtToken");
}

// create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add JWT to Authorization header if present
api.interceptors.request.use((config) => {
  const token = getJwtToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ============ AUTH ENDPOINTS =============

export const authAPI = {
  signup: async (email: string, password: string, name: string) => {
    const res = await api.post("/api/auth/signup", { email, password, name });
    if (res.data?.data?.token) setJwtToken(res.data.data.token);
    return res;
  },
  login: async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password });
    if (res.data?.data?.token) setJwtToken(res.data.data.token);
    return res;
  },
  logout: () => {
    clearJwtToken();
    return Promise.resolve();
  },
  getProfile: () => api.get("/api/auth/profile"),
};

// ============ TASK ENDPOINTS ============

export const taskAPI = {
  createTask: (
    title: string,
    description?: string,
    priority?: string,
    dueDate?: string
  ) => api.post("/api/tasks", { title, description, priority, dueDate }),

  getTasks: (status?: string) => {
    const params = status ? { status } : {};
    return api.get("/api/tasks", { params });
  },

  getTask: (id: string) => api.get(`/api/tasks/${id}`),

  updateTask: (id: string, data: any) => api.put(`/api/tasks/${id}`, data),

  deleteTask: (id: string) => api.delete(`/api/tasks/${id}`),
};

export default api;
