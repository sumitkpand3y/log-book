export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
};