'use client';

import { useState, useEffect } from 'react';
import { superadminService } from '@/services/superadminservice';
import {
  Zap,
  Database,
  HardDrive,
  Mail,
  Clock,
  Activity,
  ShieldCheck,
  RefreshCcw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Skeleton, ServiceCardSkeleton } from '@/components/ui/Skeleton';

export default function ServicesPage() {
  const [services, setServices] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await superadminService.getServiceStatus();
      setServices(response.status);
    } catch (error) {
      console.error('Error fetching services status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Remove full-page blocking loader

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">Services Status</h1>
          <p className="text-slate-500 font-medium tracking-wide">Real-time connectivity and integration health</p>
        </div>
        <button
          onClick={fetchStatus}
          className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/5 transition-all"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => <ServiceCardSkeleton key={i} />)
        ) : (
          <>
            <ServiceCard
              name="Database Core (Atlas)"
              status={services?.mongodb}
              icon={<Database size={24} />}
              desc="Primary Mongo Cluster / Primary Shard"
            />
            <ServiceCard
              name="Asset Storage (Cloudinary)"
              status={services?.cloudinary}
              icon={<HardDrive size={24} />}
              desc="Menu images and branding assets"
            />
            <ServiceCard
              name="Mail Cluster (SMTP)"
              status={services?.email}
              icon={<Mail size={24} />}
              desc="OTP and notification delivery node"
            />
            <ServiceCard
              name="Real-time Node (Socket.io)"
              status={services?.socket}
              icon={<Zap size={24} />}
              desc="Live order and table session updates"
            />
            <ServiceCard
              name="Cron Scheduler"
              status={services?.cron}
              icon={<Clock size={24} />}
              desc="Daily ledger and cleanup routines"
            />
            <ServiceCard
              name="System Gateway"
              status="connected"
              icon={<Activity size={24} />}
              desc="API Gateway and Load Balancer"
            />
          </>
        )}
      </div>

      <div className="bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-8 backdrop-blur-xl">
        <h3 className="text-white font-bold mb-4 italic uppercase tracking-widest text-xs flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-500" />
          Infrastructure Integrity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i}>
                <Skeleton width={80} height={10} className="mb-2" />
                <Skeleton width={120} height={14} />
              </div>
            ))
          ) : (
            <>
              <div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">SSL Status</div>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-black italic">
                  <ShieldCheck size={14} />
                  Managed (Auto-Renew)
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Load Balancing</div>
                <div className="flex items-center gap-2 text-white text-sm font-black uppercase italic">
                  Auto-Scaling Active
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Edge Caching</div>
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-black italic">
                  Global Edge Network
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ name, status, icon, desc }: any) {
  const isOk = status === 'connected' || status === 'operational' || status === 'running';
  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-all">
      <div className={`p-4 rounded-2xl mb-6 transition-colors inline-block ${isOk ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {icon}
      </div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-bold tracking-tight">{name}</h4>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isOk ? 'text-emerald-400' : 'text-rose-400'}`}>
            {status || 'Unknown'}
          </span>
          {isOk ? <Wifi size={14} className="text-emerald-500" /> : <WifiOff size={14} className="text-rose-500" />}
        </div>
      </div>
      <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}
