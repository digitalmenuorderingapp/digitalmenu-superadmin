'use client';

import { useState, useEffect } from 'react';
import { superadminService } from '@/services/superadminservice';
import Link from 'next/link';
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldX,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  X,
  Eye,
  Loader2 as Spinner
} from 'lucide-react';
import { Skeleton, TableRowSkeleton } from '@/components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function RestaurantMonitoring() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Modal form state
  const [subscriptionData, setSubscriptionData] = useState({
    type: 'free' as 'free' | 'paid' | 'trial',
    status: 'active' as 'active' | 'inactive' | 'expired',
    expiryDate: ''
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [triggeringReports, setTriggeringReports] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const data = await superadminService.getRestaurants();
      setRestaurants(data.restaurants);
    } catch (error) {
      toast.error('Failed to load restaurant database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleToggleStatus = async (restaurantId: string, currentStatus: string) => {
    try {
      setUpdating(true);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await superadminService.updateRestaurantStatus(restaurantId, newStatus);
      toast.success(`Restaurant ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to update restaurant status');
    } finally {
      setUpdating(false);
    }
  };

  const openSubscriptionModal = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    const sub = restaurant.subscription || { type: 'free', status: 'active', expiryDate: null };
    setSubscriptionData({
      type: sub.type,
      status: sub.status,
      expiryDate: sub.expiryDate ? new Date(sub.expiryDate).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleUpdateSubscription = async () => {
    if (!selectedRestaurant) return;
    try {
      setUpdating(true);
      await superadminService.updateSubscription(selectedRestaurant._id, {
        subscription: {
          type: subscriptionData.type,
          status: subscriptionData.status,
          expiryDate: subscriptionData.expiryDate || null
        }
      });
      toast.success('Subscription updated successfully');
      setIsModalOpen(false);
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to update subscription');
    } finally {
      setUpdating(false);
    }
  };

  const handleTriggerReports = async (isAll = false) => {
    const day = new Date().getDate();
    if (day > 5) {
      toast.error('Reports can only be triggered between 1st-5th of the month.');
      return;
    }

    const ids = isAll ? [] : selectedIds;
    if (!isAll && ids.length === 0) {
      toast.error('No restaurants selected');
      return;
    }

    if (!confirm(`Are you sure you want to trigger monthly reports for ${isAll ? 'ALL' : ids.length} restaurants?`)) return;

    try {
      setTriggeringReports(true);
      const res = await superadminService.triggerMonthlyReports(ids);
      if (res.success) {
        toast.success(res.message || 'Reports triggered successfully');
        setSelectedIds([]);
      } else {
        toast.error(res.message || 'Failed to trigger reports');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to trigger reports');
    } finally {
      setTriggeringReports(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRestaurants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRestaurants.map(r => r._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.restaurantName?.toLowerCase().includes(search.toLowerCase()) ||
    restaurant.email?.toLowerCase().includes(search.toLowerCase()) ||
    restaurant.ownerName?.toLowerCase().includes(search.toLowerCase())
  );

  // Remove full-page blocking loader

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Restaurant Database</h1>
          <p className="text-slate-400">Manage restaurant accounts, access status, and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleTriggerReports(true)}
            disabled={triggeringReports}
            className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl hover:bg-indigo-600/20 transition-all flex items-center gap-2 group"
            title="Trigger Monthly Reports for All Restaurants"
          >
            <Mail size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest hidden lg:inline">Trigger All</span>
          </button>
          <button className="p-3 bg-slate-900/50 border border-slate-800 text-slate-400 rounded-2xl hover:text-white hover:border-slate-700 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 px-8 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-8 min-w-[400px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-black text-white">
                {selectedIds.length}
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-tight">Selected</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-4">
               <button 
                onClick={() => handleTriggerReports(false)}
                disabled={triggeringReports}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
               >
                 {triggeringReports ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                 Send Reports
               </button>
               <button 
                onClick={() => setSelectedIds([])}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
               >
                 Cancel
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {restaurants.length === 0 ? (
        <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-16 text-center">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-slate-600" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">No partners found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Start by registering restaurant partners in the system.</p>
        </div>
      ) : (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/20 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                  <th className="px-8 py-5">
                    <input 
                      type="checkbox" 
                      onChange={toggleSelectAll}
                      checked={selectedIds.length > 0 && selectedIds.length === filteredRestaurants.length}
                      className="w-4 h-4 bg-slate-900 border-slate-800 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 py-5 text-left">Restaurant</th>
                  <th className="px-6 py-5">Owner</th>
                  <th className="px-6 py-5">Subscription</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Last Active</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} columns={6} />)
                ) : (
                  filteredRestaurants.map((restaurant, index) => (
                    <motion.tr
                      key={restaurant._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-white/5 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(restaurant._id)}
                          onChange={() => toggleSelect(restaurant._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 bg-slate-900 border-white/10 rounded focus:ring-indigo-500 transition-all"
                        />
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 group-hover:border-indigo-500/50 transition-all shadow-xl overflow-hidden">
                            {restaurant.logo ? (
                              <img src={restaurant.logo} alt={restaurant.restaurantName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-black text-white italic">{restaurant.restaurantName?.[0] || 'R'}</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-sm tracking-tight mb-0.5">{restaurant.restaurantName || 'Unnamed'}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                              <Mail size={10} /> {restaurant.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6 font-bold text-slate-300 text-xs italic uppercase italic tracking-widest">
                        {restaurant.ownerName || '---'}
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            restaurant.subscription?.type === 'free' ? 'text-indigo-400' : 
                            restaurant.subscription?.type === 'trial' ? 'text-amber-400' : 
                            'text-emerald-400'
                          }`}>
                            {restaurant.subscription?.type === 'free' ? 'Lifetime Access' : 
                             restaurant.subscription?.type === 'trial' ? 'Free Trial' : 
                             'Business Pro'}
                          </span>
                          <div className="text-[9px] text-slate-500 flex items-center gap-1 font-black">
                            <Clock size={10} />
                            {restaurant.subscription?.expiryDate ? new Date(restaurant.subscription.expiryDate).toLocaleDateString() : 'Lifetime'}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${restaurant.subscription?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {restaurant.subscription?.status || 'inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="text-white font-bold text-[10px]">{restaurant.requestCount || 0} REQ</span>
                          </div>
                          <span className="text-slate-500 text-[10px] font-medium tracking-tight">
                            {restaurant.lastActivity ? `${Math.floor((Date.now() - new Date(restaurant.lastActivity).getTime()) / (1000 * 60 * 60))} hrs ago` : 'Never'}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          <Link href={`/superadmin/restaurants/${restaurant._id}`}>
                            <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-all" title="View Details">
                              <Eye size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(restaurant._id, restaurant.subscription?.status || 'inactive')}
                            className={`p-2 rounded-xl transition-all ${restaurant.subscription?.status === 'active' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'}`}
                            title={restaurant.subscription?.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {restaurant.subscription?.status === 'active' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                          <button
                            onClick={() => openSubscriptionModal(restaurant)}
                            className="p-2 bg-slate-800 border border-white/5 text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 rounded-xl transition-all"
                            title="Manage Subscription"
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )))}
              </tbody>
            </table>
          </div>

          {filteredRestaurants.length > 1 && (
            <div className="bg-white/5 px-8 py-5 flex items-center justify-between border-t border-white/5">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total {filteredRestaurants.length} Partners</span>
              <div className="flex items-center gap-3">
                <button disabled className="px-4 py-2 bg-white/5 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 cursor-not-allowed">Prev</button>
                <button className="px-4 py-2 bg-white/10 text-slate-300 hover:text-white hover:bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all shadow-xl">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscription Management Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-2 mb-10">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-2">
                  <Edit3 size={28} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Manage Subscription</h2>
                <p className="text-slate-400">Updating settings for <span className="text-indigo-400 font-bold">{selectedRestaurant?.restaurantName}</span></p>
              </div>

              <div className="space-y-8">
                {/* Subscription Type Toggle */}
                <div className="flex items-center justify-between p-5 bg-slate-800/30 rounded-3xl border border-slate-800">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-bold">Plan Type</span>
                    <span className="text-xs text-slate-500">{(subscriptionData.type === 'free' || subscriptionData.type === 'trial') ? 'Lifetime Free Access' : 'Paid Business Pro'}</span>
                  </div>
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                      <button
                        onClick={() => setSubscriptionData(prev => ({ ...prev, type: 'free' }))}
                        className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all ${subscriptionData.type === 'free' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                        FREE
                      </button>
                      <button
                        onClick={() => setSubscriptionData(prev => ({ ...prev, type: 'trial' }))}
                        className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all ${subscriptionData.type === 'trial' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                        TRIAL
                      </button>
                      <button
                        onClick={() => setSubscriptionData(prev => ({ ...prev, type: 'paid' }))}
                        className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all ${subscriptionData.type === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                        PAID
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
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${subscriptionData.status === s ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-slate-500'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expiry Date Picker */}
                <div className={`space-y-3 transition-opacity duration-300 ${(subscriptionData.type === 'free' || subscriptionData.type === 'trial') ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest">Subscription Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      type="date"
                      value={subscriptionData.expiryDate}
                      onChange={(e) => setSubscriptionData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 ml-1 italic">* Only applicable for PRO accounts</p>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSubscription}
                    disabled={updating}
                    className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
