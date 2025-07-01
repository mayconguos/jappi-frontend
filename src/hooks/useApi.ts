'use client';

import { useState, useCallback } from 'react';
import api from '@/app/services/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { authorization: `${token}` };
  };

  const get = useCallback(async (url: string): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api.get(url, { headers: getAuthHeaders() });
      const result = response.data;
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la API';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      console.error(`Error in GET ${url}:`, err);
      return null;
    }
  }, []);

  const post = useCallback(async (url: string, data: unknown): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api.post(url, data, { headers: getAuthHeaders() });
      const result = response.data;
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la API';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      console.error(`Error in POST ${url}:`, err);
      return null;
    }
  }, []);

  const put = useCallback(async (url: string, data: unknown): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api.put(url, data, { headers: getAuthHeaders() });
      const result = response.data;
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la API';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      console.error(`Error in PUT ${url}:`, err);
      return null;
    }
  }, []);

  const del = useCallback(async (url: string): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api.delete(url, { headers: getAuthHeaders() });
      const result = response.data;
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la API';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      console.error(`Error in DELETE ${url}:`, err);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    reset
  };
};
