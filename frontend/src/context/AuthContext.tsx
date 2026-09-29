import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types/auth';
import { authApi } from '../api/auth';
import { queryClient } from '../api/queryClient';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const hydrateUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [isValidating, setIsValidating] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('access_token');
      const cachedUser = hydrateUser();

      if (!token || !cachedUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Verify token is still valid by calling /auth/me
        const validatedUser = await authApi.me();
        if (validatedUser.active) {
          setUser(validatedUser);
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // Token is invalid/expired — clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const persist = (token: string, u: User) => {
    queryClient.clear(); // Never reuse another session's connector data.
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(async (data: LoginRequest) => {
    setIsValidating(true);
    try {
      const res = await authApi.login(data);
      if (!res.user.active) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
        throw new Error('Your account is awaiting activation.');
      }
      persist(res.access_token, res.user);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsValidating(true);
    try {
      const res = await authApi.register(data);
      if (!res.user.active) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
        return false;
      }
      persist(res.access_token, res.user);
      return true;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsValidating(true);
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      queryClient.clear();
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsValidating(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user?.active === true,
        isLoading: isLoading || isValidating,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
