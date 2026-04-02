'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { superadminService } from '@/services/superadminservice';
import Link from 'next/link';
import {
   ArrowLeft,
   ShoppingBag,
   IndianRupee,
   LayoutGrid,
   Zap,
   Clock,
   Activity,
   ShieldCheck,
   Ban,
   CheckCircle2,
   Calendar,
   Mail,
   Phone,
   User as UserIcon,
   Store,
   ChevronRight,
   ExternalLink,
   History,
   Lock,
   Unlock,
   Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function UserDetailPage() {
   const { id } = useParams();
   const router = useRouter();
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [toggling, setToggling] = useState(false);

   useEffect(() => {
      fetchUserDetail();
   }, [id]);

   const fetchUserDetail = async () => {
      try {
         const response = await superadminService.getRestaurantDetail(id as string);
         setData(response);
      } catch (error) {
         toast.error('Failed to fetch user details');
         router.push('/superadmin/dashboard');
      } finally {
         setLoading(false);
      }
   };

   const toggleStatus = async () => {
      try {
         setToggling(true);
         await superadminService.updateUserStatus(id as string, !data.user.isActive);
         toast.success(data.user.isActive ? 'User blocked' : 'User unblocked');
         fetchUserDetail();
      } catch (error) {
         toast.error('Failed to update status');
      } finally {
         setToggling(false);
      }
   };

   if (loading) {
      return (
         <div className="h-screen flex items-center justify-center bg-[#07090e]">
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
               <span className="text-slate-400 font-medium italic">Loading Tenant Data...</span>
            </div>
         </div>
      );
   }

   const { user, stats } = data;

   return (
      <div className="min-h-screen bg-[#07090e] p-6 lg:p-10 space-y-10 selection:bg-indigo-500/30">
         {/* Navigation */}
         <div className="flex items-center gap-4">
            <Link href="/superadmin/dashboard">
               <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all">
                  <ArrowLeft size={20} />
               </button>
            </Link>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
               <span>Dashboard</span>
               <ChevronRight size={14} />
               <span className="text-white">Restaurant Profile</span>
            </div>
         </div>

         {/* Profile Header */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-8 lg:p-12 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-175 transition-transform">
               <Store size={200} className="text-indigo-500" />
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 relative z-10">
               <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-4xl shadow-2xl shadow-black/40 border-4 border-white/5">
                  {user.restaurantName?.[0] || 'R'}
               </div>

               <div className="space-y-4">
                  <div>
                     <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{user.restaurantName}</h1>
                     <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                           {user.isActive ? 'Active Status' : 'System Blocked'}
                        </span>
                        <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] rounded-full font-black uppercase tracking-widest border border-white/5">
                           {user.isFreeSubscription ? 'Trial Account' : 'Pro Partner'}
                        </span>
                        <span className="text-slate-500 text-xs font-medium flex items-center gap-1 ml-2">
                           <Calendar size={12} />
                           Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                     </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                     <div className="flex items-center gap-2 text-slate-300">
                        <UserIcon size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium">{user.ownerName}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-300">
                        <Mail size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium">{user.email}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-300">
                        <Phone size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium">{user.phone || 'No phone'}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
               <button
                  onClick={toggleStatus}
                  disabled={toggling}
                  className={`w-full lg:w-48 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2 ${user.isActive ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
               >
                  {toggling ? <Loader2 className="animate-spin" size={16} /> : (user.isActive ? <Lock size={16} /> : <Unlock size={16} />)}
                  {user.isActive ? 'Block Tenant' : 'Activate Tenant'}
               </button>
               <button className="w-full lg:w-48 py-4 bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2">
                  <ExternalLink size={16} />
                  Visit Store
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Panel */}
            <div className="lg:col-span-2 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatBox label="Total Orders" value={stats.totalOrders} icon={<ShoppingBag className="text-indigo-500" />} color="indigo" />
                  <StatBox label="Revenue Served" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<IndianRupee className="text-emerald-500" />} color="emerald" />
                  <StatBox label="Menu Items" value={stats.menuItemsCount || 0} icon={<LayoutGrid className="text-purple-500" />} color="purple" />
               </div>

               <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">System Awareness</h3>
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 tracking-widest">LIVE TRACKING</span>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <ActivityRow label="Activity Status" value={(new Date() - new Date(user.lastActivity)) < (10 * 60 * 1000) ? 'Online Now' : 'Offline'} isGood={(new Date() - new Date(user.lastActivity)) < (10 * 60 * 1000)} />
                     <ActivityRow label="API Requests (Lifetime)" value={user.requestCount || 0} />
                     <ActivityRow label="Last Activity" value={user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'Never'} />
                     <ActivityRow label="Support Status" value="Healthy" isGood={true} />
                  </div>
               </div>
            </div>

            {/* Subscription Monitoring Sidebar */}
            <div className="space-y-8">
               <div className="bg-gradient-to-br from-slate-900/50 to-indigo-900/10 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl space-y-8">
                  <div className="space-y-2">
                     <h3 className="text-white font-bold tracking-tight">Subscription Engine</h3>
                     <p className="text-slate-500 text-xs">Monitoring revenue and renewal cycles</p>
                  </div>

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Plan</span>
                        <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-lg">PRO ACTIVE</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Expiry</span>
                        <span className="text-white font-bold text-xs">{user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toDateString() : 'N/A'}</span>
                     </div>
                  </div>

                  <div className="py-20 flex flex-col items-center justify-center gap-4 bg-indigo-500/5 rounded-3xl border border-indigo-500/20">
                     <div className="p-4 bg-indigo-500/20 rounded-full animate-bounce">
                        <Zap className="text-indigo-500" size={32} />
                     </div>
                     <div className="text-center">
                        <div className="text-xl font-black text-white italic tracking-tighter">PREMIUM PARTNER</div>
                        <p className="text-slate-500 text-xs">Account qualified for enterprise support</p>
                     </div>
                  </div>

                  <button className="w-full py-4 bg-white text-indigo-900 font-black text-xs uppercase tracking-widest rounded-3xl hover:scale-105 transition-transform shadow-2xl shadow-black/40">
                     Adjust Subscriptions
                  </button>
               </div>

               <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
                  <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                     <History size={16} className="text-slate-500" />
                     Audit Trail
                  </h4>
                  <div className="space-y-4">
                     <div className="p-3 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-medium">Session Initialized</span>
                        <span className="text-slate-500 text-[10px]">Recent</span>
                     </div>
                     <div className="p-3 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between opacity-50">
                        <span className="text-slate-400 text-xs font-medium">Menu Published</span>
                        <span className="text-slate-500 text-[10px]">2d ago</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function StatBox({ label, value, icon, color }: any) {
   const colors: any = {
      indigo: "from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-500",
      emerald: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-500",
      purple: "from-purple-500/10 to-transparent border-purple-500/20 text-purple-500",
   };

   return (
      <div className={`bg-slate-900/30 border rounded-[2rem] p-6 backdrop-blur-xl flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-all ${colors[color]}`}>
         <div className="flex items-center justify-between">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
               {icon}
            </div>
            <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-opacity" />
         </div>
         <div>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            <div className="text-2xl font-black text-white italic tracking-tighter mt-1">{value}</div>
         </div>
      </div>
   );
}

function ActivityRow({ label, value, isGood }: any) {
   return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/2 hover:bg-white/10 transition-colors">
         <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</span>
         <div className="flex items-center gap-3">
            <span className={`text-sm font-black italic tracking-tight ${isGood ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
            <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : (isGood === false ? 'bg-rose-500' : 'bg-slate-700')}`} />
         </div>
      </div>
   );
}
