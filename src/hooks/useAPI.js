import { useState, useEffect, useCallback } from 'react';
import { APIError } from '../lib/api/client';

export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError(err.message, 500);
      // setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error, setError };
}