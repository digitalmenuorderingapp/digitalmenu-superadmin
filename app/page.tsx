'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/SuperadminAuthContext';
import { FaSpinner, FaUtensils } from 'react-icons/fa';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Superadmin is logged in, redirect to live stats
        router.replace('/superadmin/live-stats');
      } else {
        // Auto-login failed, show error or redirect to auth
        router.replace('/auth');
      }
    }
  }, [router, isLoading, isAuthenticated, user]);

  // Show loading spinner while checking auth / auto-login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <FaUtensils className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
        <FaSpinner className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">Initializing superadmin session...</p>
      </div>
    </div>
  );
}
