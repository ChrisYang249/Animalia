import { useState, useEffect, useCallback } from 'react';
import { api } from '../config/api';
import type { Cat } from '../data/cats';

export const useCats = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Cat[]>('/cats/');
      setCats(response.data);
    } catch {
      setError('Failed to load cats');
      setCats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  return { cats, loading, error, refetch: fetchCats };
};
