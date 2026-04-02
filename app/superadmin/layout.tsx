'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  ChevronRight,
  Activity,
  BarChart3,
  ShoppingBag,
  CreditCard,
  Zap,
  History,
  Server,
  Database,
  Cloud,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SuperadminAuthProvider, useSuperadminAuth } from '@/context/SuperadminAuthContext';
import { superadminSocketService } from '@/services/superadmin-socket';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuperadminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperadminAuthProvider>
      {children}
    </SuperadminAuthProvider>
  );
}
