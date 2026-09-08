import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '../types/auth';
import { authApi, getStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalIntent: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatar: string) => Promise<void>;
  updateProfile: (name: string, avatar: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (intent?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void, intentMessage?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalIntent, setAuthModalIntent] = useState<string | null>(null);

  const pendingActionRef = useRef<(() => void) | null>(null);

  // Check login status on mount
  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        const { user } = await authApi.getMe();
        setUser(user);
        setToken(stored);
      } catch (err) {
        console.warn('Auth token invalid or expired:', err);
        removeStoredToken();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const openAuthModal = (intent?: string) => {
    setAuthModalIntent(intent || 'Vui lòng đăng nhập để tiếp tục.');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalIntent(null);
    pendingActionRef.current = null;
  };

  // Require auth guard: runs action immediately if authenticated; otherwise queues it and prompts modal
  const requireAuth = (action: () => void, intentMessage?: string): boolean => {
    if (user) {
      action();
      return true;
    }
    pendingActionRef.current = action;
    openAuthModal(intentMessage);
    return false;
  };

  const handlePostAuthSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    setIsAuthModalOpen(false);
    setAuthModalIntent(null);

    // Execute pending action if any
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      setTimeout(() => action(), 100);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.user && res.token) {
      handlePostAuthSuccess(res.user, res.token);
    }
  };

  const register = async (name: string, email: string, password: string, avatar: string) => {
    const res = await authApi.register(name, email, password, avatar);
    if (res.user && res.token) {
      handlePostAuthSuccess(res.user, res.token);
    }
  };

  const updateProfile = async (name: string, avatar: string) => {
    const res = await authApi.updateProfile(name, avatar);
    if (res.user) {
      setUser(res.user);
      if (res.token) setToken(res.token);
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        authModalIntent,
        login,
        register,
        updateProfile,
        logout,
        openAuthModal,
        closeAuthModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
