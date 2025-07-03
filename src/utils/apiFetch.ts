import { APIError } from '@/lib/api/client';
import { apiCache } from '@/lib/api/cache';


const buildUrlWithParams = (url: string, params?: Record<string, any>) => {
  if (!params) return url
  const query = new URLSearchParams(params).toString()
  return query ? `${url}?${query}` : url
}
const baseFetch = async (
  url: string,
  options: RequestInit = {},
  config: {
    auth?: boolean;
    cache?: boolean;
    cacheTTL?: number;
    params?: any;
    headers?: Record<string, string>;
  } = {}
) => {
  const fullUrl = buildUrlWithParams(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`,
    config.params
  );

  const token =
    typeof window !== 'undefined' && config.auth !== false
      ? localStorage.getItem('token')
      : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...config.headers,
    ...options.headers,
  };

  const cacheKey = apiCache.generateKey(fullUrl, {
    method: options.method,
    body: options.body,
    params: config.params,
  });

  // 💾 RETURN FROM CACHE
  if (config.cache) {
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(data.message || 'Unknown error', response.status);
  }

  // 💾 STORE TO CACHE
  if (config.cache) {
    apiCache.set(cacheKey, data, config.cacheTTL);
  }

  return data;
};

export const apiFetch = {
  get: (url: string, config?: any) =>
    baseFetch(url, { method: 'GET' }, config),

  post: (url: string, body?: any, config?: any) =>
    baseFetch(
      url,
      { method: 'POST', body: JSON.stringify(body) },
      config
    ),

  put: (url: string, body?: any, config?: any) =>
    baseFetch(
      url,
      { method: 'PUT', body: JSON.stringify(body) },
      config
    ),

  delete: (url: string, config?: any) =>
    baseFetch(url, { method: 'DELETE' }, config),
};
