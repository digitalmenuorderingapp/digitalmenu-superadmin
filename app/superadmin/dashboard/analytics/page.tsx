'use client';

import { useState, useEffect } from 'react';
import { superadminService } from '@/services/superadminservice';
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  Loader2 as Spinner
} from 'lucide-react';
import { Skeleton, MetricCardSkeleton } from '@/components/ui/Skeleton';
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

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await superadminService.getAnalytics();
        setData(response.analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);



  // Remove full-page blocking loader

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">Platform Analytics</h1>
          <p className="text-slate-500 font-medium tracking-wide">Trends and growth metrics (Privacy-Safe)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              label="Total Orders"
              value={data?.today?.orders || 0}
              sub="Across all tenants"
              icon={<ShoppingBag size={20} />}
            />
            <MetricCard
              label="New Partners"
              value={data?.today?.newUsers || 0}
              sub="Today's growth"
              icon={<Users size={20} />}
            />
            <MetricCard
              label="Platform Revenue"
              value={`₹${(data?.today?.revenue || 0).toLocaleString()}`}
              sub="Aggregated processing"
              icon={<TrendingUp size={20} />}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl">
          <h3 className="text-white font-bold mb-8 flex items-center justify-between italic uppercase tracking-widest text-xs">
            Order Velocity
            <span className="text-emerald-400">7-Day Trend</span>
          </h3>
          <div className="h-[300px] w-full relative">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <Spinner className="w-8 h-8 text-indigo-500 animate-spin opacity-20" />
                <Skeleton width="100%" height="80%" className="opacity-10" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.weeklyData || []}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl">
          <h3 className="text-white font-bold mb-8 flex items-center justify-between italic uppercase tracking-widest text-xs">
            Tenant Growth
            <span className="text-indigo-400">New Onboarding</span>
          </h3>
          <div className="h-[300px] w-full relative">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <Spinner className="w-8 h-8 text-indigo-500 animate-spin opacity-20" />
                <Skeleton width="100%" height="80%" className="opacity-10 shadow-inner" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.weeklyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon }: any) {
  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          {icon}
        </div>
        <ArrowUpRight className="text-slate-700 group-hover:text-white transition-colors" size={16} />
      </div>
      <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-black text-white mb-1 tracking-tight">{value}</div>
      <div className="text-slate-500 text-[10px] font-medium">{sub}</div>
    </div>
  );
}
