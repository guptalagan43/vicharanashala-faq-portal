import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Role = 'student' | 'admin';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  alternateEmail?: string;
  mobile?: string;
  collegeName?: string;
  collegeAddress?: string;
  collegeWebsite?: string;
  departmentName?: string;
  departmentWebpage?: string;
  programme?: string;
  branch?: string;
  gpa?: string;
  cvFileName?: string;
}

export interface User extends UserProfile {
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, role: Role) => Promise<void>;
  signup: (name: string, email: string, role: Role, cvFileName?: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('auth_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = async (email: string, role: Role) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Hardcoded mock admin user
    if (role === 'admin' && email === 'admin@vins.in') {
      setUser({
        name: 'Super Admin',
        email,
        role,
      });
      return;
    }

    if (role === 'admin' && email !== 'admin@vins.in') {
      throw new Error('Invalid admin credentials');
    }

    setUser({
      name: email.split('@')[0],
      email,
      role,
    });
  };

  const signup = async (name: string, email: string, role: Role, cvFileName?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUser({
      name,
      email,
      role,
      cvFileName,
    });
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => prev ? { ...prev, ...data } : null);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
