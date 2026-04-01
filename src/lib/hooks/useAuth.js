/**
 * Custom Hook: useAuth
 * Gestiona la autenticación del usuario
 */

import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await base44.auth.logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Implementar según tu auth system
      const result = await base44.auth.login(email, password);
      setUser(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    logout,
    login,
    refetchUser: fetchCurrentUser,
    isAuthenticated: !!user
  };
};

export default useAuth;
