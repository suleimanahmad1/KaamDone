import api from "../api";

export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function registerRequest(name, email, password) {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data.data;
}

export async function updateProfile(payload) {
  const { data } = await api.put("/auth/profile", payload);
  return data.data;
}

export async function forgotPassword(email) {
  const { data } = await api.post("/auth/forgot-password", { email }, { timeout: 30000 });
  return {
    message: data.message,
    resetLink: data.data?.resetLink || null,
    emailSent: Boolean(data.data?.emailSent),
  };
}

export async function resetPassword(token, password) {
  const { data } = await api.post("/auth/reset-password", { token, password });
  return data;
}
