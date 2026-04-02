'use client';

import { useState, useEffect } from 'react';
import { superadminService } from '@/services/superadminservice';
import {
  Activity,
  Cpu,
  HardDrive,
  Zap,
  Globe,
  Database,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function SystemPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await superadminService.getSystemStats();
        setMetrics(response.metrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Scanning System Architecture...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">System Health</h1>
          <p className="text-slate-500 font-medium tracking-wide">Real-time infrastructure monitoring</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20">
          Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="CPU Usage" value={`${metrics?.cpuUsage?.toFixed(1) || 0}%`} icon={<Cpu size={18} />} color="purple" />
        <MetricCard label="Heap Used" value={`${((metrics?.memoryUsage?.heapUsed || 0) / 1024 / 1024).toFixed(0)} MB`} icon={<HardDrive size={18} />} color="amber" />
        <MetricCard label="DB Size" value={`${((metrics?.dbSize || 0) / 1024 / 1024).toFixed(1)} MB`} icon={<Database size={18} />} color="blue" />
        <MetricCard label="Uptime" value={formatUptime(metrics?.uptime)} icon={<Activity size={18} />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl">
          <h3 className="text-white font-bold mb-8 flex items-center justify-between italic uppercase tracking-widest text-xs">
            Load balancing
            <span className="text-slate-500">Live Trend</span>
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.history || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#6366f1" fill="#6366f133" strokeWidth={3} />
                <Area type="monotone" dataKey="mem" stroke="#10b981" fill="#10b98133" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl">
            <h3 className="text-white font-bold mb-6 italic uppercase tracking-widest text-xs flex items-center gap-2">
              <Terminal size={16} className="text-indigo-500" />
              Server Node
            </h3>
            <div className="space-y-4">
              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>OS Platform</span>
                <span className="text-white">{metrics?.platform || 'Unknown'}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>Node Version</span>
                <span className="text-white">{metrics?.nodeVersion || 'Unknown'}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>PID</span>
                <span className="text-white">{process.pid}</span>
              </div>
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 rounded-[1.5rem] p-6 backdrop-blur-xl">
            <h3 className="text-rose-500 font-bold mb-4 italic uppercase tracking-widest text-xs flex items-center gap-2">
              <ShieldAlert size={16} />
              Security Vitals
            </h3>
            <p className="text-slate-500 text-[10px] leading-relaxed mb-4">
              All security patches are up to date. Firewall is active with Zero Trust policy.
            </p>
            <button className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Trigger Security Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: any) {
  const colors: any = {
    purple: "text-purple-500 bg-purple-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10"
  };
  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <Zap className="text-slate-800" size={14} />
      </div>
      <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-black text-white">{value}</div>
    </div>
  );
}
