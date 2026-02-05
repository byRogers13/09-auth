import axios from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/api';
const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;

export const nextServer = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

nextServer.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});