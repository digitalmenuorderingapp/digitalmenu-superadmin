'use client';

import { 
  Settings, 
  ShieldCheck, 
  Zap, 
  EyeOff, 
  Clock, 
  Save,
  Bell,
  Lock
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
              <Settings size={28} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Platform Settings</h1>
              <p className="text-slate-500 font-medium tracking-wide">Governance and privacy configurations</p>
           </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">
           <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <SettingsSection 
            title="Privacy Guard" 
            desc="Configure redaction levels for the Superadmin interface."
            icon={<EyeOff size={20} />}
         >
            <div className="space-y-6 pt-4">
               <ToggleItem 
                  label="Strict Redaction" 
                  desc="Hide all customer names and order item names platform-wide."
                  checked={true}
               />
               <ToggleItem 
                  label="Anonymize IP Addresses" 
                  desc="Mask user and restaurant IPs in monitoring logs."
                  checked={true}
               />
               <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center gap-4">
                  <div className="text-indigo-400">
                     <ShieldCheck size={20} />
                  </div>
                  <p className="text-slate-400 text-[10px] italic">
                     Privacy-First Architecture is currently locked by System Administrator.
                  </p>
               </div>
            </div>
         </SettingsSection>

         <SettingsSection 
            title="System Pulse" 
            desc="Control monitoring frequency and data retention."
            icon={<Zap size={20} />}
         >
            <div className="space-y-6 pt-4">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-white text-xs font-bold font-black tracking-tight italic uppercase">Monitoring Refresh Rate</div>
                     <div className="text-slate-500 text-[10px]">How often to refresh system health metrics.</div>
                  </div>
                  <select className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all outline-none">
                     <option>5 Seconds</option>
                     <option selected>10 Seconds</option>
                     <option>30 Seconds</option>
                  </select>
               </div>
               <ToggleItem 
                  label="Persistence Mode" 
                  desc="Store aggregate analytics data for historical 7-day reports."
                  checked={true}
               />
            </div>
         </SettingsSection>

         <SettingsSection 
            title="Access Governance" 
            desc="Security protocols for the Superadmin Dashboard."
            icon={<Lock size={20} />}
         >
            <div className="space-y-6 pt-4">
               <ToggleItem 
                  label="Multi-Factor Auth" 
                  desc="Require OTP validation for every Superadmin session entry."
                  checked={true}
               />
               <ToggleItem 
                  label="Inactivity Timeout" 
                  desc="Automatically logout Superadmin after 30 minutes of inactivity."
                  checked={true}
               />
            </div>
         </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ title, desc, icon, children }: any) {
   return (
      <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
         <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-white/5 rounded-xl text-slate-400">
               {icon}
            </div>
            <div>
               <h3 className="text-white font-black text-sm uppercase tracking-widest italic">{title}</h3>
               <p className="text-slate-500 text-[10px] font-medium tracking-tight">{desc}</p>
            </div>
         </div>
         <div className="border-t border-white/5 mt-6">
            {children}
         </div>
      </div>
   );
}

function ToggleItem({ label, desc, checked }: any) {
   return (
      <div className="flex items-center justify-between group">
         <div>
            <div className="text-white text-xs font-black tracking-tight italic uppercase">{label}</div>
            <div className="text-slate-500 text-[10px]">{desc}</div>
         </div>
         <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-indigo-600' : 'bg-white/5 border border-white/10'}`}>
            <div className={`absolute inset-y-1 w-4 bg-white rounded-full shadow-lg transition-all ${checked ? 'left-7' : 'left-1'}`} />
         </div>
      </div>
   );
}
