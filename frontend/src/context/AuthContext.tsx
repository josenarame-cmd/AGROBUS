import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('agrobus_user');
    const token = localStorage.getItem('agrobus_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('agrobus_user');
        localStorage.removeItem('agrobus_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const userData = response.data;
    const userObj: User = {
      userId: userData.userId,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      token: userData.token,
    };
    localStorage.setItem('agrobus_token', userData.token);
    localStorage.setItem('agrobus_user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const register = async (data: any) => {
    const response = await authAPI.register(data);
    const userData = response.data;
    const userObj: User = {
      userId: userData.userId,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      token: userData.token,
    };
    localStorage.setItem('agrobus_token', userData.token);
    localStorage.setItem('agrobus_user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('agrobus_token');
    localStorage.removeItem('agrobus_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
