import api from "../api";
import { buildTaskFormData } from "../utils/taskSubmit";

export async function fetchTasks(params = {}, signal) {
  const { data } = await api.get("/tasks", { params, signal });
  return data.data || [];
}

export async function getTask(id, signal) {
  const { data } = await api.get(`/tasks/${id}`, { signal });
  return data.data;
}

export async function createTask(payload) {
  const formData = buildTaskFormData(payload);
  const { data } = await api.post("/tasks", formData);
  return data.data;
}

export async function updateTask(id, payload) {
  const formData = buildTaskFormData(payload);
  const { data } = await api.put(`/tasks/${id}`, formData);
  return data.data;
}

export async function deleteTask(id) {
  const { data } = await api.delete(`/tasks/${id}`);
  return data.data;
}

export async function fetchTaskActivity(taskId, signal) {
  const { data } = await api.get(`/tasks/${taskId}/activity`, { signal });
  return data.data || [];
}
