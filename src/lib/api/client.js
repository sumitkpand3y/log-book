import { API_CONFIG } from './config';
import { apiCache } from './cache';

class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get auth token from storage
  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  }

  // Build headers with auth
  buildHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Build URL with query parameters
  buildURL(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  }

  // Main request method with retry logic
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers = {},
      params = {},
      cache = false,
      cacheTTL,
      retries = API_CONFIG.retries,
      timeout = API_CONFIG.timeout,
    } = options;

    const url = this.buildURL(endpoint, params);
    const cacheKey = cache ? apiCache.generateKey(url, { method, body, params }) : null;

    // Check cache for GET requests
    if (cache && method === 'GET') {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const requestOptions = {
      method,
      headers: this.buildHeaders(headers),
      signal: AbortSignal.timeout(timeout),
    };

    if (body) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new APIError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }

        const data = await response.json();
        
        // Cache successful GET requests
        if (cache && method === 'GET' && cacheKey) {
          apiCache.set(cacheKey, data, cacheTTL);
        }

        return data;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry for certain errors
        if (error instanceof APIError && [400, 401, 403, 404].includes(error.status)) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.retryDelay * Math.pow(2, attempt))
        );
      }
    }
    
    throw lastError;
  }

  // HTTP method shortcuts
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Custom error class
export class APIError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = new APIClient();
