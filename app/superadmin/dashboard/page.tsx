'use client';

import { useState, useEffect } from 'react';
import { superadminService } from '@/services/superadminservice';
import Link from 'next/link';
import {
   Users,
   ShoppingBag,
   UserCheck,
   TrendingUp,
   TrendingDown,
   ArrowUpRight,
   Loader2,
   Activity,
   ShieldCheck,
   Cpu,
   Database,
   HardDrive,
   Globe,
   Mail,
   Zap,
   Clock,
   ExternalLink,
   Lock,
   Unlock,
   Eye,
   History as HistoryIcon
} from 'lucide-react';
import { Skeleton, CompactStatSkeleton } from '@/components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   BarChart,
   Bar,
   Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuperadminOverview() {
   const [metrics, setMetrics] = useState<any>(null);
   const [services, setServices] = useState<any>(null);
   const [analytics, setAnalytics] = useState<any>(null);
   const [users, setUsers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [refreshInterval, setRefreshInterval] = useState(10000); // 10s default

   const fetchData = async () => {
      try {
         const [metricsData, servicesData, analyticsData, usersData] = await Promise.all([
            superadminService.getSystemStats(),
            superadminService.getServiceStatus(),
            superadminService.getAnalytics(),
            superadminService.getUsers()
         ]);

         setMetrics(metricsData.metrics);
         setServices(servicesData.status);
         setAnalytics(analyticsData.analytics);
         setUsers(usersData.users);
      } catch (error) {
         console.error('Refresh error:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
   }, [refreshInterval]);

   // Remove full-page blocking loader

   return (
      <div className="min-h-screen bg-[#07090e] p-4 lg:p-6 space-y-6 selection:bg-indigo-500/30">
         {/* Header */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                     <ShieldCheck className="text-indigo-500" size={24} />
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">System Monitor</h1>
               </div>
               <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Platform Intelligence · SAHIN-CORE-v1
               </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
               {[5, 10, 30].map((s) => (
                  <button
                     key={s}
                     onClick={() => setRefreshInterval(s * 1000)}
                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${refreshInterval === s * 1000 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                  >
                     {s}S
                  </button>
               ))}
               <div className="w-px h-6 bg-white/10 mx-2" />
               <button onClick={fetchData} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <Zap size={18} />
               </button>
            </div>
         </div>
         {/* Tier 1: System Health metrics - Compact Row */}
         <div className="grid grid-cols-5 gap-3">
            {!metrics ? (
               Array(5).fill(0).map((_, i) => <CompactStatSkeleton key={i} />)
            ) : (
               <>
                  <CompactStat
                     label="Requests Today"
                     value={metrics?.todayRequests || 0}
                     total={metrics?.totalRequests}
                     icon={<Globe size={16} />}
                     color="blue"
                  />
                  <CompactStat
                     label="CPU Usage"
                     value={`${metrics?.cpuUsage?.toFixed(1) || 0}%`}
                     status="Stable"
                     icon={<Cpu size={16} />}
                     color="purple"
                  />
                  <CompactStat
                     label="Memory"
                     value={`${((metrics?.memoryUsage?.rss || 0) / 1024 / 1024)?.toFixed(0)}MB`}
                     sub={`Heap ${((metrics?.memoryUsage?.heapUsed || 0) / 1024 / 1024)?.toFixed(0)}MB`}
                     icon={<HardDrive size={16} />}
                     color="amber"
                  />
                  <CompactStat
                     label="Database"
                     value={`${((metrics?.database?.size || 0) / 1024 / 1024).toFixed(1)}MB`}
                     sub={`${metrics?.database?.documents || 0} docs`}
                     icon={<Database size={16} />}
                     color="emerald"
                  />
                  <CompactStat
                     label="Restaurants"
                     value={users?.length || 0}
                     sub={`${analytics?.today?.orders || 0} orders`}
                     icon={<ShoppingBag size={16} />}
                     color="rose"
                  />
               </>
            )}
         </div>

         {/* Tier 2: Performance Charts & Aggregated Stats */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts Section */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8">
                     <TrendingUp className="text-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity" size={40} />
                  </div>
                  <div className="mb-8">
                     <h3 className="text-xl font-bold text-white tracking-tight italic uppercase">Platform Throughput</h3>
                     <p className="text-slate-500 text-sm">Aggregated requests per hour across all tenants</p>
                  </div>
                  <div className="h-[300px] w-full">
                     {!metrics ? (
                        <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                           <Loader2 className="w-8 h-8 text-indigo-500 animate-spin opacity-20" />
                           <Skeleton width="100%" height="80%" className="opacity-10" />
                        </div>
                     ) : (
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={metrics?.throughputData || []}>
                              <defs>
                                 <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip
                                 contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                 itemStyle={{ color: '#fff' }}
                              />
                              <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     )}
                  </div>
               </div>

               <div className="bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-5 backdrop-blur-xl">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2 italic uppercase tracking-widest text-[10px]">
                     <Zap size={14} className="text-amber-500" />
                     Operational Pulse
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {!metrics || !analytics ? (
                        Array(3).fill(0).map((_, i) => (
                           <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                              <Skeleton width="60%" height={8} />
                              <Skeleton width="40%" height={20} />
                           </div>
                        ))
                     ) : (
                        <>
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Active Sockets</span>
                              <span className="text-xl font-black text-white">{metrics?.activeSockets || 0}</span>
                           </div>
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Daily Orders</span>
                              <span className="text-xl font-black text-emerald-400">{analytics?.today?.orders || 0}</span>
                           </div>
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Active Partners</span>
                              <span className="text-xl font-black text-indigo-400">{users?.length || 0}</span>
                           </div>
                        </>
                     )}
                  </div>
               </div>
            </div>

            {/* Sidebar Health/Alerts */}
            <div className="space-y-4">
               <div className="bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl h-full">
                  <h3 className="text-white font-bold mb-8 flex items-center justify-between italic uppercase tracking-widest text-xs">
                     System Alerts
                     <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-md font-black">All Systems Nominal</span>
                  </h3>

                  <div className="space-y-4">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                           <ShieldCheck size={20} />
                        </div>
                        <div>
                           <div className="text-white text-xs font-bold">MFA Required</div>
                           <div className="text-slate-500 text-[10px]">Security policy is active</div>
                        </div>
                     </div>

                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 opacity-50">
                        <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500">
                           <HistoryIcon size={20} />
                        </div>
                        <div>
                           <div className="text-white text-xs font-bold tracking-tight">No recent critical logs</div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-10 p-6 bg-indigo-600 rounded-[1.5rem] relative overflow-hidden group">
                     <div className="absolute -right-4 -bottom-4 animate-bounce">
                        <Activity size={80} className="text-white/10" />
                     </div>
                     <h4 className="text-white font-bold mb-2 relative z-10 text-sm">Tech Health Overview</h4>
                     <p className="text-indigo-100 text-[10px] leading-relaxed mb-6 relative z-10 opacity-80">
                        System-wide monitoring is active with 10s refresh rate.
                     </p>
                     <Link href="/superadmin/dashboard/system">
                        <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform relative z-10 shadow-xl shadow-black/20">
                           View Full Monitoring
                        </button>
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function CompactStat({ label, value, sub, total, status, icon, color }: any) {
   const colors: any = {
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/10' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
      emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
      rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'shadow-rose-500/10' }
   };
   const c = colors[color];

   return (
      <div className={`${c.bg} border ${c.border} rounded-xl p-3 relative overflow-hidden group hover:scale-[1.02] transition-all duration-200 shadow-lg ${c.glow}`}>
         <div className="flex items-center gap-2 mb-2">
            <div className={`${c.text}`}>{icon}</div>
            <span className={`${c.text} text-[10px] font-bold uppercase tracking-wider`}>{label}</span>
         </div>
         <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white tracking-tight">{value}</span>
            {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
            {total && <span className="text-[10px] text-slate-500">/ {total}</span>}
            {status && <span className={`text-[10px] ${c.text}`}>{status}</span>}
         </div>
      </div>
   );
}

function ServiceItem({ name, status, icon }: any) {
   const isOk = status === 'connected' || status === 'operational' || status === 'running';
   return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
         <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl transition-colors ${isOk ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
               {icon}
            </div>
            <span className="text-slate-300 text-xs font-bold tracking-tight">{name}</span>
         </div>
         <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isOk ? 'text-emerald-400' : 'text-rose-400'}`}>
               {status || 'Unknown'}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
         </div>
      </div>
   );
}
