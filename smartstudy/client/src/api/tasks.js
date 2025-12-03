import api from './axios'
export async function listTasks(){ const { data } = await api.get('/tasks'); return data.tasks || data }
export async function createTask(body){ const { data } = await api.post('/tasks', body); return data.task || data }
export async function updateTask(id, updates){ const { data } = await api.put(`/tasks/${id}`, updates); return data.task || data }
export async function deleteTask(id){ const { data } = await api.delete(`/tasks/${id}`); return data }
