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

function SuperadminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile closed by default
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { logout, superadmin } = useSuperadminAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navSections = [
    {
      label: 'System',
      items: [
        {
          name: 'Live Stats',
          href: '/superadmin/live-stats',
          icon: Activity,
          current: pathname === '/superadmin/live-stats' || pathname.startsWith('/superadmin/live-stats/')
        },
        {
          name: 'Usage Analysis',
          href: '/superadmin/usage-analysis',
          icon: BarChart3,
          current: pathname === '/superadmin/usage-analysis' || pathname.startsWith('/superadmin/usage-analysis/')
        }
      ]
    },
    {
      label: 'Manage',
      items: [
        {
          name: 'Restaurants',
          href: '/superadmin/restaurants',
          icon: ShoppingBag,
          current: pathname === '/superadmin/restaurants' || pathname.startsWith('/superadmin/restaurants/')
        }
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const NavItem = ({ item, isMobile = false }: { item: any; isMobile?: boolean }) => {
    const Icon = item.icon;
    const isActive = item.current;

    return (
      <Link
        href={item.href}
        onClick={() => isMobile && setSidebarOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
          isActive
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        {(isMobile || desktopSidebarExpanded) && (
          <>
            <span className="text-sm font-medium">{item.name}</span>
            {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            {!isActive && (
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </>
        )}
      </Link>
    );
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${(isMobile || desktopSidebarExpanded) ? '' : 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            {(isMobile || desktopSidebarExpanded) && (
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">Superadmin</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">Control Panel</p>
              </div>
            )}
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-2">
            {(isMobile || desktopSidebarExpanded) && (
              <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {section.label}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem key={item.name} item={item} isMobile={isMobile} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        {(isMobile || desktopSidebarExpanded) && mounted && (
          <div className="mb-4 px-4 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <span className="text-xs font-bold text-indigo-400">{superadmin?.email?.charAt(0).toUpperCase() || 'S'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{superadmin?.email || 'Superadmin'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-xs">Administrator</p>
            </div>
          </div>
        )}
        {(isMobile || desktopSidebarExpanded) && !mounted && (
          <div className="mb-4 px-4 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <span className="text-xs font-bold text-indigo-400">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Superadmin</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-xs">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group ${(isMobile || desktopSidebarExpanded) ? '' : 'justify-center'}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(isMobile || desktopSidebarExpanded) && <span className="text-sm font-medium">Logout</span>}
        </button>

        {(isMobile || desktopSidebarExpanded) && (
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <Link
              href="/"
              className="flex items-center space-x-3 w-full px-4 py-2 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </div>
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out bg-slate-900 ${desktopSidebarExpanded ? 'w-72' : 'w-20'}`}>
        <div className="flex-1">
          <SidebarContent />
        </div>
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setDesktopSidebarExpanded(!desktopSidebarExpanded)}
          className="p-3 border-t border-slate-800 text-slate-500 hover:text-white flex items-center justify-center bg-slate-900/30"
        >
          <motion.div
            animate={{ rotate: desktopSidebarExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 h-screen z-50 md:hidden shadow-2xl shadow-indigo-500/20"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header Bar */}
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight capitalize">
                  {navSections.flatMap(s => s.items).find(item => item.current)?.name || 'Dashboard'}
                </h2>
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Optional header actions */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-950">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


export default function SuperadminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperadminAuthProvider>
      <SuperadminLayoutContent>
        {children}
      </SuperadminLayoutContent>
    </SuperadminAuthProvider>
  );
}
