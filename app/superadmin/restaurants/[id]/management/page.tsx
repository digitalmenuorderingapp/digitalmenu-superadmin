'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  FileText,
  CalendarDays,
  Clock,
  ChefHat,
  Receipt,
  CreditCard
} from 'lucide-react';

interface RestaurantData {
  restaurant: {
    _id: string;
    restaurantName: string;
    ownerName: string;
    email: string;
    subscription: {
      status: string;
      plan: string;
    };
    lastActivity: string;
    createdAt: string;
  };
  stats: {
    totalOrders: number;
    totalRevenue: number;
    ordersServed: number;
    menuItemsCount: number;
  };
}

interface AnalyticsData {
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
    customers: number;
  }>;
  orderTypes: Array<{
    name: string;
    value: number;
  }>;
  topItems: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    orders: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  summary: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    uniqueCustomers: number;
    peakHour: string;
    growthRate: number;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function RestaurantManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [id, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurant details
      const restaurantRes = await fetch(`/api/superadmin/restaurant/${id}`);
      const restaurantJson = await restaurantRes.json();
      
      if (!restaurantJson.success) {
        throw new Error(restaurantJson.message || 'Failed to fetch restaurant');
      }
      
      setRestaurantData(restaurantJson);
      
      // Fetch analytics data (mock data for now - will be replaced with real endpoint)
      const mockAnalytics: AnalyticsData = {
        dailyStats: generateDailyStats(parseInt(dateRange)),
        orderTypes: [
          { name: 'Dine-in', value: 45 },
          { name: 'Takeaway', value: 30 },
          { name: 'Delivery', value: 25 },
        ],
        topItems: [
          { name: 'Chicken Biryani', orders: 156, revenue: 23400 },
          { name: 'Paneer Tikka', orders: 134, revenue: 18760 },
          { name: 'Butter Chicken', orders: 128, revenue: 25600 },
          { name: 'Naan Bread', orders: 245, revenue: 9800 },
          { name: 'Gulab Jamun', orders: 98, revenue: 4900 },
        ],
        hourlyDistribution: [
          { hour: '9AM', orders: 12 },
          { hour: '10AM', orders: 18 },
          { hour: '11AM', orders: 25 },
          { hour: '12PM', orders: 45 },
          { hour: '1PM', orders: 52 },
          { hour: '2PM', orders: 38 },
          { hour: '3PM', orders: 22 },
          { hour: '4PM', orders: 18 },
          { hour: '5PM', orders: 28 },
          { hour: '6PM', orders: 42 },
          { hour: '7PM', orders: 48 },
          { hour: '8PM', orders: 55 },
          { hour: '9PM', orders: 35 },
          { hour: '10PM', orders: 20 },
        ],
        paymentMethods: [
          { method: 'Cash', count: 234, amount: 45600 },
          { method: 'Card', count: 189, amount: 52300 },
          { method: 'UPI', count: 312, amount: 48900 },
          { method: 'Wallet', count: 45, amount: 8900 },
        ],
        summary: {
          totalOrders: 780,
          totalRevenue: 155700,
          avgOrderValue: 199.6,
          uniqueCustomers: 456,
          peakHour: '8:00 PM',
          growthRate: 12.5,
        },
      };
      
      setAnalyticsData(mockAnalytics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyStats = (days: number) => {
    const stats = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      stats.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders: Math.floor(Math.random() * 50) + 80,
        revenue: Math.floor(Math.random() * 15000) + 20000,
        customers: Math.floor(Math.random() * 30) + 40,
      });
    }
    
    return stats;
  };

  const handleGenerateReport = async () => {
    // Trigger monthly report generation
    try {
      const response = await fetch('/api/superadmin/trigger-monthly-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantIds: [id] }),
      });
      
      if (response.ok) {
        alert('Monthly report generation triggered successfully!');
      } else {
        alert('Failed to trigger report generation');
      }
    } catch (err) {
      console.error('Error triggering report:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-400">Loading restaurant analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !restaurantData || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading data</div>
          <p className="text-slate-400">{error || 'Failed to load restaurant data'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { restaurant, stats } = restaurantData;
  const { summary } = analyticsData;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href={`/superadmin/restaurants/${id}`}
            className="flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Restaurant
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{restaurant.restaurantName}</h1>
            <p className="text-slate-400">Management Dashboard & Analytics</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg"
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
            </select>
            
            <button
              onClick={handleGenerateReport}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
            
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{summary.totalOrders.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+{summary.growthRate}%</span>
            <span className="text-slate-500 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">₹{summary.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Avg. Order: ₹{summary.avgOrderValue.toFixed(2)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Unique Customers</p>
              <p className="text-2xl font-bold text-white">{summary.uniqueCustomers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Peak Hour: {summary.peakHour}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Menu Items</p>
              <p className="text-2xl font-bold text-white">{stats.menuItemsCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Orders Served: {stats.ordersServed}
          </div>
        </motion.div>
      </div>

      {/* Charts Grid - 2x2 Layout */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Revenue & Orders Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Revenue & Orders Trend
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.dailyStats}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748B" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue (₹)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Types Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-green-400" />
              Order Types Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.orderTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.orderTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Selling Items */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-400" />
              Top Selling Items
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748B" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                    return [value, 'Orders'];
                  }}
                />
                <Legend />
                <Bar dataKey="orders" fill="#3B82F6" name="Orders" radius={[0, 4, 4, 0]} />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Hourly Order Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              Hourly Order Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                />
                <Bar dataKey="orders" fill="#8B5CF6" name="Orders" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Payment Methods & Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-pink-400" />
            Payment Methods
          </h3>
          <div className="space-y-3">
            {analyticsData.paymentMethods.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-300">{method.method}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono">{method.count} orders</div>
                  <div className="text-slate-500 text-sm">₹{method.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Restaurant Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CalendarDays className="w-5 h-5 mr-2 text-cyan-400" />
            Restaurant Info
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Owner:</span>
              <span className="text-white">{restaurant.ownerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-white">{restaurant.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                restaurant.subscription.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {restaurant.subscription.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Plan:</span>
              <span className="text-white capitalize">{restaurant.subscription.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Joined:</span>
              <span className="text-white">
                {new Date(restaurant.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Active:</span>
              <span className="text-white">
                {new Date(restaurant.lastActivity).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link
              href={`/superadmin/restaurants/${id}`}
              className="flex items-center space-x-2 w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span className="text-white">View Details</span>
            </Link>
            
            <button
              onClick={handleGenerateReport}
              className="flex items-center space-x-2 w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-white">Generate Monthly Report</span>
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="text-white">Export Analytics</span>
            </button>
            
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span className="text-white">Refresh Data</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
