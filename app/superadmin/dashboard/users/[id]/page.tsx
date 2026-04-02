'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { superadminService } from '@/services/superadminservice';
import {
   ArrowLeft,
   ShoppingBag,
   Utensils,
   QrCode,
   Calendar,
   Activity,
   TrendingUp,
   ShieldCheck,
   Zap,
   Lock,
   Unlock,
   CheckCircle2,
   XCircle,
   ChevronRight,
   Loader2 as Spinner
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton, MetricSkeleton } from '@/components/ui/Skeleton';

export default function RestaurantDetailsPage() {
   const { id } = useParams();
   const router = useRouter();
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [updating, setUpdating] = useState(false);
   const [subscriptionData, setSubscriptionData] = useState({
      type: 'free' as 'free' | 'paid',
      status: 'active' as 'active' | 'inactive' | 'expired',
      expiryDate: ''
   });

   const fetchDetail = async () => {
      try {
         setLoading(true);
         const response = await superadminService.getUserDetail(id as string);
         setData(response);
         // Initialize subscription data from user
         const sub = response.user?.subscription || { type: 'free', status: 'active', expiryDate: null };
         setSubscriptionData({
            type: sub.type,
            status: sub.status,
            expiryDate: sub.expiryDate ? new Date(sub.expiryDate).toISOString().split('T')[0] : ''
         });
      } catch (error) {
         toast.error('Failed to load restaurant insights');
         router.push('/superadmin/dashboard/users');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (id) fetchDetail();
   }, [id]);

   // Remove full-page blocking loader
   const user = data?.user || {};
   const stats = data?.stats || {};

   const handleToggleStatus = async () => {
      try {
         setUpdating(true);
         const newStatus = user.subscription?.status === 'active' ? 'inactive' : 'active';
         await superadminService.updateUserStatus(user._id, newStatus);
         toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
         fetchDetail();
      } catch (error) {
         toast.error('Failed to update user status');
      } finally {
         setUpdating(false);
      }
   };

   const handleUpdateSubscription = async () => {
      try {
         setUpdating(true);
         await superadminService.updateSubscription(user._id, {
            subscription: {
               type: subscriptionData.type,
               status: subscriptionData.status,
               expiryDate: subscriptionData.expiryDate || null
            }
         });
         toast.success('Subscription updated successfully');
         setIsModalOpen(false);
         fetchDetail();
      } catch (error) {
         toast.error('Failed to update subscription');
      } finally {
         setUpdating(false);
      }
   };

   return (
      <div className="space-y-8 max-w-5xl mx-auto">
         <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
         >
            <ArrowLeft size={16} /> Back to Registry
         </button>

         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               {loading ? (
                  <Skeleton width={80} height={80} className="rounded-[2rem]" />
               ) : (
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white italic shadow-2xl shadow-indigo-500/20">
                     {user.restaurantName?.[0] || 'R'}
                  </div>
               )}
               <div className="space-y-2">
                  {loading ? (
                     <>
                        <Skeleton width={200} height={32} />
                        <Skeleton width={150} height={16} />
                     </>
                  ) : (
                     <>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{user.restaurantName || 'Unnamed'}</h1>
                        <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${user.subscription?.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                           {user.subscription?.status === 'active' ? 'Active Platform Node' : `Operational Node ${user.subscription?.status || 'inactive'}`}
                        </p>
                     </>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button
                  onClick={handleToggleStatus}
                  disabled={updating}
                  className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${user.subscription?.status === 'active' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20'}`}>
                  {updating ? 'Updating...' : (user.subscription?.status === 'active' ? 'Revoke Access' : 'Restore Access')}
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
               Array(3).fill(0).map((_, i) => <MetricSkeleton key={i} />)
            ) : (
               <>
                  <MetricBox label="Operational Volume" value={stats.totalOrders} sub="Total Lifetime Orders" icon={<ShoppingBag />} color="indigo" />
                  <MetricBox label="Menu Architecture" value={stats.menuItemsCount || 0} sub="Active Menu Items" icon={<Utensils />} color="emerald" />
                  <MetricBox label="Platform Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} sub="Revenue Processed" icon={<Zap />} color="amber" />
               </>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
               <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 italic flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-400" />
                  Account Core
               </h3>
               <div className="space-y-6">
                  {loading ? (
                     Array(4).fill(0).map((_, i) => (
                        <div key={i} className="space-y-2">
                           <Skeleton width="30%" height={8} />
                           <Skeleton width="60%" height={12} />
                        </div>
                     ))
                  ) : (
                     <>
                        <DetailItem label="Owner Identity" value={user.ownerName || 'Unknown'} />
                        <DetailItem label="Primary Endpoint" value={user.email} />
                        <DetailItem label="Onboarding Date" value={new Date(user.createdAt).toLocaleDateString()} />
                        <DetailItem label="Last Activity" value={user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'Never'} />
                     </>
                  )}
               </div>
            </div>

            <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
               <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 italic flex items-center gap-2">
                  <Calendar size={16} className="text-amber-400" />
                  Subscription Engine
               </h3>
               <div className="space-y-6">
                  {loading ? (
                     Array(3).fill(0).map((_, i) => (
                        <div key={i} className="space-y-2">
                           <Skeleton width="30%" height={8} />
                           <Skeleton width="60%" height={12} />
                        </div>
                     ))
                  ) : (
                     <>
                        <DetailItem label="Current Plan" value={user.subscription?.type === 'free' ? 'Trial / Lifetime Free' : 'Business Pro'} />
                        <DetailItem label="Expiry Schedule" value={user.subscription?.expiryDate ? new Date(user.subscription.expiryDate).toLocaleDateString() : 'Continuous'} />
                        <DetailItem label="Verification" value={user.isVerified ? 'Identity Verified' : 'Pending Verification'} />
                     </>
                  )}
                  <div className="pt-4">
                     <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={loading}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest border border-white/5 transition-all disabled:opacity-20">
                        Adjust Plan Geometry
                     </button>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
               <ShieldCheck size={200} />
            </div>
            <h3 className="text-white font-black text-xl mb-2 italic">Privacy Enforcement</h3>
            <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
               In accordance with the <span className="text-indigo-400 font-bold">Privacy-First Architecture</span>, order-level details, customer identities, and physical table locations are redacted.
               Superadmin access is restricted to operational counts and system health metrics.
            </p>
         </div>

         {/* Subscription Modal */}
         <AnimatePresence>
            {isModalOpen && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                  onClick={() => setIsModalOpen(false)}
               >
                  <motion.div
                     initial={{ scale: 0.95, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.95, y: 20 }}
                     onClick={(e) => e.stopPropagation()}
                     className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-[2.5rem] p-8 shadow-2xl"
                  >
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-white tracking-tight">Adjust Plan Geometry</h3>
                        <button
                           onClick={() => setIsModalOpen(false)}
                           className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
                        >
                           <XCircle size={24} />
                        </button>
                     </div>

                     <div className="space-y-6">
                        {/* Subscription Type Toggle */}
                        <div className="flex items-center justify-between p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
                           <div className="flex flex-col gap-1">
                              <span className="text-white font-bold">Plan Type</span>
                              <span className="text-xs text-slate-400">{subscriptionData.type === 'free' ? 'Lifetime Free Access' : 'Paid Business Pro'}</span>
                           </div>
                           <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                              <button
                                 onClick={() => setSubscriptionData(prev => ({ ...prev, type: 'free' }))}
                                 className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${subscriptionData.type === 'free' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-white'}`}
                              >
                                 FREE
                              </button>
                              <button
                                 onClick={() => setSubscriptionData(prev => ({ ...prev, type: 'paid' }))}
                                 className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${subscriptionData.type === 'paid' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                              >
                                 PRO
                              </button>
                           </div>
                        </div>

                        {/* Subscription Status */}
                        <div className="space-y-3">
                           <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest">Operational Status</label>
                           <div className="grid grid-cols-3 gap-2">
                              {['active', 'inactive', 'expired'].map((s) => (
                                 <button
                                    key={s}
                                    onClick={() => setSubscriptionData(prev => ({ ...prev, status: s as any }))}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${subscriptionData.status === s ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-slate-500'}`}
                                 >
                                    {s}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Expiry Date Picker */}
                        <div className={`space-y-3 transition-opacity duration-300 ${subscriptionData.type === 'free' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                           <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest">Subscription Expiry Date</label>
                           <input
                              type="date"
                              value={subscriptionData.expiryDate}
                              onChange={(e) => setSubscriptionData(prev => ({ ...prev, expiryDate: e.target.value }))}
                              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                           />
                           <p className="text-[10px] text-slate-500 ml-1 italic">* Only applicable for PRO accounts</p>
                        </div>

                        <div className="pt-4 flex gap-4">
                           <button
                              onClick={() => setIsModalOpen(false)}
                              className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all"
                           >
                              Cancel
                           </button>
                           <button
                              onClick={handleUpdateSubscription}
                              disabled={updating}
                              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
                           >
                              {updating ? 'Updating...' : 'Update Plan'}
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

function MetricBox({ label, value, sub, icon, color }: any) {
   const colors: any = {
      indigo: "bg-indigo-500/10 text-indigo-400",
      emerald: "bg-emerald-500/10 text-emerald-400",
      amber: "bg-amber-500/10 text-amber-400"
   };
   return (
      <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-xl group hover:border-white/10 transition-all">
         <div className={`p-3 rounded-2xl mb-4 w-fit ${colors[color]}`}>
            {icon}
         </div>
         <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</div>
         <div className="text-2xl font-black text-white tracking-tight mb-1">{value}</div>
         <div className="text-slate-600 text-[10px] font-medium italic">{sub}</div>
      </div>
   );
}

function DetailItem({ label, value }: any) {
   return (
      <div className="flex items-center justify-between py-1 border-b border-white/5 pb-3 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
         <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</span>
         <span className="text-slate-200 text-xs font-bold">{value}</span>
      </div>
   );
}
