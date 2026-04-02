'use client';

import { useState, useEffect } from 'react';
import { superadminService } from '@/services/superadminservice';
import {
  ShoppingBag,
  TrendingUp,
  PieChart,
  Activity,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

export default function OrdersPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await superadminService.getOrdersOverview();
        setStats(response.stats);
      } catch (error) {
        console.error('Error fetching orders overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const typeData = stats?.typeDistribution ? Object.entries(stats.typeDistribution).map(([name, value]) => ({ name, value })) : [
    { name: 'dine-in', value: 0 },
    { name: 'takeaway', value: 0 },
    { name: 'delivery', value: 0 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Loading Platform Distribution...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">Orders Overview</h1>
          <p className="text-slate-500 font-medium tracking-wide">Platform-wide performance monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={stats?.totalOrders || 0} icon={<ShoppingBag size={18} />} color="indigo" />
        <StatCard label="Total Volume" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={<TrendingUp size={18} />} color="emerald" />
        <StatCard label="Avg. Order" value={`₹${(stats?.avgOrderValue || 0).toFixed(0)}`} icon={<Activity size={18} />} color="purple" />
        <StatCard label="Growth" value="+12.5%" icon={<ArrowUpRight size={18} />} color="amber" isGood={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl">
          <h3 className="text-white font-bold mb-8 flex items-center justify-between italic uppercase tracking-widest text-xs">
            Order Types
            <PieChart size={16} className="text-indigo-500" />
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {typeData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-400 capitalize">{item.name}</span>
                </div>
                <span className="text-white font-bold">{item.value as React.ReactNode}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl">
          <h3 className="text-white font-bold mb-8 flex items-center gap-2 italic uppercase tracking-widest text-xs">
            <Activity size={16} className="text-emerald-500" />
            Volume Distribution
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Breaksfast', val: 120 },
                { name: 'Lunch', val: 450 },
                { name: 'Snacks', val: 230 },
                { name: 'Dinner', val: 680 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="val" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, isGood }: any) {
  const colors: any = {
    indigo: "text-indigo-500 bg-indigo-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    amber: "text-amber-500 bg-amber-500/10"
  };
  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        {isGood !== undefined && (
          <span className={`text-[10px] font-black ${isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
            +14%
          </span>
        )}
      </div>
      <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-black text-white tracking-tight">{value}</div>
    </div>
  );
}
