import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('vom_user'));
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});
export const registerUser    = (data)         => API.post('/auth/register', data);
export const loginUser       = (data)         => API.post('/auth/login', data);
export const getProfile      = ()             => API.get('/auth/profile');
export const createLog       = (data)         => API.post('/logs', data);
export const getMyLogs       = (params)       => API.get('/logs', { params });
export const getLogById      = (id)           => API.get(`/logs/${id}`);
export const updateLog       = (id, data)     => API.put(`/logs/${id}`, data);
export const deleteLog       = (id)           => API.delete(`/logs/${id}`);
export const getAllLogs       = (params)       => API.get('/supervisor/logs', { params });
export const reviewLog        = (id, data)    => API.put(`/supervisor/logs/${id}/review`, data);
export const getStudents      = ()            => API.get('/supervisor/students');
export const getStudentDashboard    = () => API.get('/dashboard/student');
export const getSupervisorDashboard = () => API.get('/dashboard/supervisor');

export default API;
