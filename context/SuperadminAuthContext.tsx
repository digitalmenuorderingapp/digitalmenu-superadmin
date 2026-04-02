'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { superadminService } from '@/services/superadminservice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SuperadminUser {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SuperadminAuthContextType {
  superadmin: SuperadminUser | null;
  user: SuperadminUser | null; // Alias for compatibility
  isLoading: boolean;
  isAuthenticated: boolean;
  requestOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<any>;
  logout: () => void;
}

const SuperadminAuthContext = createContext<SuperadminAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [superadmin, setSuperadmin] = useState<SuperadminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('superadminUser');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await superadminService.me();
      if (response.success && response.user) {
        setSuperadmin(response.user);
        localStorage.setItem('isSuperadmin', 'true');
        localStorage.setItem('superadminUser', JSON.stringify(response.user));
      } else {
        localStorage.removeItem('isSuperadmin');
        localStorage.removeItem('superadminUser');
        setSuperadmin(null);
      }
    } catch (error) {
      localStorage.removeItem('isSuperadmin');
      setSuperadmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const requestOTP = async (email: string) => {
    try {
      await superadminService.requestOTP(email);
      toast.success('OTP sent to your email');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await superadminService.verifyOTP(email, otp);
      if (response.success) {
        const userData = response.user;
        setSuperadmin(userData);
        localStorage.setItem('isSuperadmin', 'true');
        localStorage.setItem('superadminUser', JSON.stringify(userData));
        toast.success('Login successful');
      }
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await superadminService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear all possible auth cookies
      const cookies = ['accessToken', 'refreshToken', 'token'];
      cookies.forEach(cookie => {
        document.cookie = `${cookie}=; Max-Age=0; path=/;`;
      });

      localStorage.removeItem('isSuperadmin');
      localStorage.removeItem('superadminUser');
      setSuperadmin(null);
      toast.success('Logged out successfully');
      router.push('/superadmin/login');
    }
  };

  return (
    <SuperadminAuthContext.Provider
      value={{
        superadmin,
        user: superadmin, // Alias for compatibility
        isLoading,
        isAuthenticated: !!superadmin,
        requestOTP,
        verifyOTP,
        logout,
      }}
    >
      {children}
    </SuperadminAuthContext.Provider>
  );
}

// Export aliases for compatibility with adminWeb-style imports
export { AuthProvider as SuperadminAuthProvider };

export function useAuth() {
  const context = useContext(SuperadminAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth as useSuperadminAuth };
