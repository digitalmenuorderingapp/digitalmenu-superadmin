'use client';

import { useState, useEffect } from 'react';
import { superadminService } from '@/services/superadminservice';
import {
   CreditCard,
   TrendingUp,
   Calendar,
   Users,
   Search,
   ChevronRight,
   ShieldCheck,
   Zap
} from 'lucide-react';
import { Skeleton, TableRowSkeleton } from '@/components/ui/Skeleton';

export default function SubscriptionsPage() {
   const [users, setUsers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchUsers = async () => {
         try {
            const response = await superadminService.getUsers();
            setUsers(response.users);
         } catch (error) {
            console.error('Error fetching users:', error);
         } finally {
            setLoading(false);
         }
      };
      fetchUsers();
   }, []);

   const totalActive = users.filter(u => u.subscription?.status === 'active').length;
   const trialUsers = users.filter(u => u.subscription?.type === 'free').length;
   const proUsers = users.filter(u => u.subscription?.type === 'paid').length;

   const expiringUsers = users.filter(u => {
      if (u.subscription?.type === 'free' || !u.subscription?.expiryDate) return false;
      const expiry = new Date(u.subscription.expiryDate);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      return expiry > today && expiry <= thirtyDaysFromNow;
   }).length;

   // Remove full-page blocking loader

   return (
      <div className="space-y-6 max-w-7xl mx-auto">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">Subscriptions</h1>
               <p className="text-slate-500 font-medium tracking-wide">Business monitoring and plan management</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {loading ? (
               Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-4">
                     <Skeleton circle width={32} height={32} />
                     <Skeleton width="60%" height={8} />
                     <Skeleton width="40%" height={24} />
                  </div>
               ))
            ) : (
               <>
                  <MetricCard label="Trial Access" value={trialUsers} icon={<Zap size={18} />} color="amber" />
                  <MetricCard label="Pro Plans" value={proUsers} icon={<ShieldCheck size={18} />} color="indigo" />
                  <MetricCard label="Active Accounts" value={totalActive} icon={<Users size={18} />} color="emerald" />
                  <MetricCard label="Expiring (30d)" value={expiringUsers} icon={<Calendar size={18} />} color="purple" />
               </>
            )}
         </div>

         <div className="bg-slate-900/30 border border-white/5 rounded-[1.5rem] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8 overflow-hidden">
               <h3 className="text-white font-bold italic uppercase tracking-widest text-xs">Plan Distribution</h3>
               <div className="relative group">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                     type="text"
                     placeholder="Search Partner..."
                     className="bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all w-64"
                  />
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                        <th className="pb-4 px-4">Restaurant</th>
                        <th className="pb-4 px-4">Current Plan</th>
                        <th className="pb-4 px-4">Expiry Date</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 px-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {loading ? (
                        Array(3).fill(0).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
                     ) : (
                        users.map((user) => (
                           <tr key={user._id} className="group hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-black/20">
                                       {user.restaurantName?.[0] || 'R'}
                                    </div>
                                    <div className="text-white font-bold text-xs tracking-tight">{user.restaurantName || 'Unnamed'}</div>
                                 </div>
                              </td>
                              <td className="py-4 px-4">
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${user.subscription?.type === 'free' ? 'text-amber-400' : 'text-indigo-400'}`}>
                                    {user.subscription?.type === 'free' ? 'Trial Access' : 'Business Pro'}
                                 </span>
                              </td>
                              <td className="py-4 px-4 text-slate-400 text-xs font-medium">
                                 {user.subscription?.expiryDate ? new Date(user.subscription.expiryDate).toLocaleDateString() : 'Lifetime Free'}
                              </td>
                              <td className="py-4 px-4">
                                 <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.subscription?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {user.subscription?.status || 'inactive'}
                                 </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                 <button className="p-2 bg-white/5 hover:bg-indigo-600 group-hover:text-white text-slate-500 rounded-lg transition-all">
                                    <ChevronRight size={16} />
                                 </button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}

function MetricCard({ label, value, icon, color }: any) {
   const colors: any = {
      indigo: "text-indigo-500 bg-indigo-500/10 shadow-indigo-500/5",
      emerald: "text-emerald-500 bg-emerald-500/10 shadow-emerald-500/5",
      purple: "text-purple-500 bg-purple-500/10 shadow-purple-500/5",
      amber: "text-amber-500 bg-amber-500/10 shadow-amber-500/5"
   };
   return (
      <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 backdrop-blur-xl group hover:border-white/10 transition-all">
         <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl ${colors[color]}`}>
               {icon}
            </div>
            <TrendingUp className="text-slate-800" size={14} />
         </div>
         <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
         <div className="text-2xl font-black text-white tracking-tighter italic">{value}</div>
      </div>
   );
}
