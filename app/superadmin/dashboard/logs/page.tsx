'use client';

import { useState, useEffect } from 'react';
import { superadminService } from '@/services/superadminservice';
import {
  ShieldCheck,
  History,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  Terminal
} from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await superadminService.getAuditLogs({ page: 1, limit: 50 });
        setLogs(response.logs || []);
        if (response.pagination) setPagination(response.pagination);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Decrypting Audit Trail...</div>;

  // Group logs by date
  const groupedLogs = logs.reduce((acc: any, log: any) => {
    const dateStr = new Date(log.createdAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">Alerts & Logs</h1>
          <p className="text-slate-500 font-medium tracking-wide">Privacy-safe platform audit trail</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Security Events" value={logs.filter(l => l.type === 'auth' && l.status === 'failed').length} icon={<ShieldCheck size={18} />} color="emerald" />
        <MetricCard label="System Alerts" value={logs.filter(l => l.type === 'system').length} icon={<ShieldAlert size={18} />} color="amber" />
        <MetricCard label="Management Actions" value={pagination.total} icon={<History size={18} />} color="indigo" />
      </div>

      <div className="bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-6 overflow-hidden flex-shrink-0">
          <h3 className="text-white font-bold italic uppercase tracking-widest text-xs flex items-center gap-2">
            <Terminal size={14} className="text-indigo-400" />
            Platform Trail
          </h3>
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Audit Trail..."
              className="bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all w-64"
            />
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {Object.keys(groupedLogs).length > 0 ? Object.keys(groupedLogs).map((date, index) => (
            <div key={index} className="space-y-3">
              <div className="sticky top-0 bg-[#020617]/90 backdrop-blur-md z-10 py-1 flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-white/5"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">{date}</span>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>
              {groupedLogs[date].map((log: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${log.type === 'auth' ? (log.status === 'failed' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400') :
                        log.type === 'system' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-indigo-500/10 text-indigo-400'
                      }`}>
                      {log.type === 'auth' ? <ShieldCheck size={16} /> : log.type === 'system' ? <Activity size={16} /> : <History size={16} />}
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold leading-tight">{log.action}</div>
                      <div className="text-slate-500 text-[10px] font-mono mt-0.5 tracking-tight uppercase">
                        By {log.user.split('@')[0]} · {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-400 transition-colors">
                    {log.type}
                  </div>
                </div>
              ))}
            </div>
          )) : (
            <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5 text-slate-500">
              No operational events recorded in this session.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 border-t border-white/5 pt-6 flex-shrink-0">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Showing {logs.length} of {pagination.total} logs · Page {pagination.page}/{pagination.pages || 1}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white/5 text-slate-500 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:hover:text-slate-500" disabled={pagination.page <= 1}>
              <ChevronLeft size={16} />
            </button>
            <button className="p-2 bg-white/5 text-slate-500 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:hover:text-slate-500" disabled={pagination.page >= pagination.pages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: any) {
  const colors: any = {
    indigo: "text-indigo-500 bg-indigo-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/10"
  };
  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-black text-white">{value}</div>
    </div>
  );
}
