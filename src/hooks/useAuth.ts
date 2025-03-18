import { useCallback, useState } from 'react';
import { api } from '@/services/api';
import { User } from '@/types/User';

interface AuthError {
  message: string;
  code: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.login({ email, password });
      const { user, token } = response;
      
      // Store token in secure storage
      await api.setAuthToken(token);
      
      setState(prev => ({
        ...prev,
        user,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      setState(prev => ({
        ...prev,
        error: {
          message: error.message,
          code: 'AUTH_LOGIN_ERROR',
        },
        isLoading: false,
      }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await api.logout();
      await api.removeAuthToken();
      
      setState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      setState(prev => ({
        ...prev,
        error: {
          message: error.message,
          code: 'AUTH_LOGOUT_ERROR',
        },
        isLoading: false,
      }));
      throw err;
    }
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.register(data);
      const { user, token } = response;
      
      // Store token in secure storage
      await api.setAuthToken(token);
      
      setState(prev => ({
        ...prev,
        user,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      setState(prev => ({
        ...prev,
        error: {
          message: error.message,
          code: 'AUTH_REGISTER_ERROR',
        },
        isLoading: false,
      }));
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await api.resetPassword(email);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      setState(prev => ({
        ...prev,
        error: {
          message: error.message,
          code: 'AUTH_RESET_PASSWORD_ERROR',
        },
        isLoading: false,
      }));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    register,
    resetPassword,
    clearError,
  };
} 