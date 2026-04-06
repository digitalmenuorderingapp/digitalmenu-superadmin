'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Download,
  Filter,
  Server,
  Globe,
  Shield,
  Layers,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Check,
  X,
  Cloud
} from 'lucide-react';
import api from '@/services/api';
import { superadminService } from '@/services/superadminservice';

interface AuditLog {
  _id: string;
  type: 'auth' | 'user' | 'order' | 'system' | 'settings';
  action: string;
  user: string;
  ip: string;
  status: 'success' | 'failed';
  details: any;
  createdAt: string;
}

interface EndpointPerformance {
  _id: string;
  endpoint: string;
  method: string;
  totalRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  lastAccessed: string;
}

interface HealthSummary {
  current: {
    requests: {
      total: number;
      currentMinute: number;
    };
    performance: {
      averageResponseTime: number;
      errorRate: number;
    };
    system: {
      cpuUsage: number;
      memoryUsage: number;
    };
  };
  today: {
    totalRequests: number;
    health: {
      overall: string;
      uptime: number;
    };
  };
  weekTrend: Array<{
    date: string;
    totalRequests: number;
    health: {
      overall: string;
    };
  }>;
  healthScore: string;
  uptime: number;
  totalIncidents: number;
}

interface DailyUsage {
  _id: string;
  date: string;
  totalRequests: number;
  peakRequestsPerMinute: number;
  peakRequestTime: string;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  cpu: {
    averageUsage: number;
    peakUsage: number;
  };
  memory: {
    averageUsage: number;
    peakUsage: number;
  };
  dbOperations: {
    averageQueryTime: number;
    slowQueries: number;
  };
  errors: {
    totalErrors: number;
    errorRate: number;
  };
  network: {
    totalBandwidth: number;
  };
  health: {
    overall: string;
  };
  hourlyStats: Array<{
    hour: number;
    requests: number;
    averageResponseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    errors: number;
  }>;
}

interface PeakUsage {
  date: string;
  peakRequestsPerMinute: number;
  peakRequestTime: string;
  cpu: {
    peakUsage: number;
    peakTime: string;
  };
  memory: {
    peakUsage: number;
    peakTime: string;
  };
  network: {
    peakConnections: number;
    peakConnectionTime: string;
  };
}

interface StorageStats {
  cloudinary: {
    used: number;
    limit: number;
    usedFormatted: string;
    limitFormatted: string;
    percentage: number;
    bandwidth: {
      used: number;
      limit: number;
      formatted: string;
      limitFormatted: string;
      percentage: number;
    };
    requests: number;
    plan: string;
  };
  mongodb: {
    status?: string;
    dataSize: number;
    storageSize: number;
    indexSize: number;
    totalSize: number;
    dataSizeFormatted: string;
    storageSizeFormatted: string;
    indexSizeFormatted: string;
    totalSizeFormatted: string;
    limit: number;
    limitFormatted: string;
    percentage: number;
    opsPerSecondLimit: number;
    collections: number;
    documents: number;
    indexes: number;
  };
}

export default function UsageAnalysisPage() {
  const [usageData, setUsageData] = useState<DailyUsage[]>([]);
  const [peakData, setPeakData] = useState<PeakUsage[]>([]);
  const [endpointPerformance, setEndpointPerformance] = useState<EndpointPerformance[]>([]);
  const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('requests');
  
  // Storage Stats State
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  
  // Caching State (30s Stale Time)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const STALE_TIME = 30000; // 30 seconds

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchTime > STALE_TIME) {
      fetchAllData();
    }
  }, [dateRange]);

  const fetchAllData = async (force = false) => {
    const now = Date.now();
    if (!force && lastFetchTime !== 0 && now - lastFetchTime < STALE_TIME) {
      console.log('Using cached usage analysis metrics (stale < 30s)');
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        fetchUsageData(),
        fetchPeakData(),
        fetchEndpointPerformance(),
        fetchHealthSummary(),
        fetchStorageStats()
      ]);
      setLastFetchTime(now);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageData = async () => {
    try {
      const response = await api.get(`/server-monitoring/usage-analysis?days=${dateRange}`);
      if (response.data.success) {
        setUsageData(response.data.data);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch usage data');
    }
  };

  const fetchPeakData = async () => {
    try {
      const response = await api.get(`/server-monitoring/peak-usage?days=${dateRange}`);
      if (response.data.success) {
        setPeakData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch peak data:', err);
    }
  };

  const fetchEndpointPerformance = async () => {
    try {
      const response = await api.get(`/server-monitoring/endpoint-performance?days=${dateRange}`);
      if (response.data.success) {
        setEndpointPerformance(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch endpoint performance:', err);
    }
  };

  const fetchHealthSummary = async () => {
    try {
      const response = await api.get('/server-monitoring/health-summary');
      if (response.data.success) {
        setHealthSummary(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch health summary:', err);
    }
  };

  const fetchStorageStats = async () => {
    try {
      const [cloudinaryRes, mongoRes] = await Promise.all([
        api.get('/server-monitoring/cloudinary-stats'),
        api.get('/server-monitoring/mongo-stats')
      ]);
      
      if (cloudinaryRes.data.success && mongoRes.data.success) {
        setStorageStats({
          cloudinary: cloudinaryRes.data.cloudinary,
          mongodb: mongoRes.data.mongodb
        });
      }
    } catch (err) {
      console.error('Failed to fetch storage stats:', err);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'fair':
      case 'poor':
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Requests', 'Avg Response Time', 'CPU Usage', 'Memory Usage', 'Error Rate', 'Health'],
      ...usageData.map(day => [
        new Date(day.date).toLocaleDateString(),
        day.totalRequests,
        day.averageResponseTime,
        day.cpu.averageUsage,
        day.memory.averageUsage,
        day.errors?.errorRate?.toFixed(2) ?? '0.00',
        day.health?.overall ?? 'unknown'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-usage-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-400">Loading usage analysis...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalRequests = usageData.reduce((sum, day) => sum + day.totalRequests, 0);
  const avgResponseTime = usageData.length > 0 
    ? usageData.reduce((sum, day) => sum + day.averageResponseTime, 0) / usageData.length 
    : 0;
  const avgCpuUsage = usageData.length > 0
    ? usageData.reduce((sum, day) => sum + (day.cpu?.averageUsage ?? 0), 0) / usageData.length
    : 0;
  const avgMemoryUsage = usageData.length > 0
    ? usageData.reduce((sum, day) => sum + (day.memory?.averageUsage ?? 0), 0) / usageData.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usage Analysis</h1>
          <p className="text-slate-400">Historical server performance and usage trends</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-indigo-400" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Total Requests</div>
            <div className="text-xs text-slate-500">Last {dateRange} days</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-green-400" />
            <TrendingDown className="w-4 h-4 text-green-400" />
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{Math.round(avgResponseTime)}ms</div>
            <div className="text-sm text-slate-400">Avg Response Time</div>
            <div className="text-xs text-slate-500">Last {dateRange} days</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Cpu className="w-8 h-8 text-blue-400" />
            <div className={`w-2 h-2 rounded-full ${
              avgCpuUsage > 80 ? 'bg-red-500' : 
              avgCpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{Math.round(avgCpuUsage)}%</div>
            <div className="text-sm text-slate-400">Avg CPU Usage</div>
            <div className="text-xs text-slate-500">Last {dateRange} days</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8 text-purple-400" />
            <div className={`w-2 h-2 rounded-full ${
              avgMemoryUsage > 80 ? 'bg-red-500' : 
              avgMemoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{Math.round(avgMemoryUsage)}%</div>
            <div className="text-sm text-slate-400">Avg Memory Usage</div>
            <div className="text-xs text-slate-500">Last {dateRange} days</div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Requests & Response Time Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Requests & Response Time Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                <YAxis yAxisId="left" stroke="#64748B" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="totalRequests" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorRequests)" 
                  name="Requests"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="averageResponseTime" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Avg Response (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CPU & Memory Usage Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-purple-400" />
            CPU & Memory Usage Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                <YAxis stroke="#64748B" fontSize={12} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Legend />
                <Line type="monotone" dataKey="cpu.averageUsage" stroke="#8B5CF6" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memory.averageUsage" stroke="#EC4899" strokeWidth={2} name="Memory %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Error Rate Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Error Rate Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                <YAxis stroke="#64748B" fontSize={12} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94A3B8' }}
                  formatter={(value) => [`${(value as number | undefined)?.toFixed(2) ?? '0.00'}%`, 'Error Rate']}
                />
                <Area 
                  type="monotone" 
                  dataKey="errors.errorRate" 
                  stroke="#EF4444" 
                  fillOpacity={1} 
                  fill="url(#colorErrors)" 
                  name="Error Rate %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Health Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-400" />
            Health Score Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Excellent', value: usageData.filter(d => d.health?.overall === 'excellent').length, color: '#10B981' },
                    { name: 'Good', value: usageData.filter(d => d.health?.overall === 'good').length, color: '#3B82F6' },
                    { name: 'Fair', value: usageData.filter(d => d.health?.overall === 'fair').length, color: '#F59E0B' },
                    { name: 'Poor', value: usageData.filter(d => d.health?.overall === 'poor').length, color: '#EF4444' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {[
                    { color: '#10B981' },
                    { color: '#3B82F6' },
                    { color: '#F59E0B' },
                    { color: '#EF4444' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Storage Statistics */}
      {storageStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cloudinary Storage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-blue-400" />
              Cloudinary Storage
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Storage Used</span>
                  <span className="text-sm font-mono text-white">
                    {storageStats.cloudinary.usedFormatted} / {storageStats.cloudinary.limitFormatted}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      storageStats.cloudinary.percentage > 80 ? 'bg-red-500' :
                      storageStats.cloudinary.percentage > 60 ? 'bg-orange-500' :
                      storageStats.cloudinary.percentage > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(storageStats.cloudinary.percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {storageStats.cloudinary.percentage}% used (Free Plan: 25 GB max)
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Bandwidth (Monthly)</span>
                  <span className="text-sm font-mono text-white">
                    {storageStats.cloudinary.bandwidth.formatted} / {storageStats.cloudinary.bandwidth.limitFormatted}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      storageStats.cloudinary.bandwidth.percentage > 80 ? 'bg-red-500' :
                      storageStats.cloudinary.bandwidth.percentage > 60 ? 'bg-orange-500' :
                      storageStats.cloudinary.bandwidth.percentage > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(storageStats.cloudinary.bandwidth.percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {storageStats.cloudinary.bandwidth.percentage}% used
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Transformations:</span>
                <span className="text-white font-mono">{storageStats.cloudinary.requests.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* MongoDB Storage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-green-400" />
              MongoDB Atlas Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Total Storage</span>
                  <span className="text-sm font-mono text-white">
                    {storageStats.mongodb.totalSizeFormatted} / {storageStats.mongodb.limitFormatted}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      storageStats.mongodb.percentage > 80 ? 'bg-red-500' :
                      storageStats.mongodb.percentage > 60 ? 'bg-orange-500' :
                      storageStats.mongodb.percentage > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(storageStats.mongodb.percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {storageStats.mongodb.percentage}% used
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Collections</div>
                  <div className="text-lg font-bold text-white">{storageStats.mongodb.collections}</div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Documents</div>
                  <div className="text-lg font-bold text-white">{storageStats.mongodb.documents.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex justify-between text-xs px-1">
                <span className="text-slate-500">Avg Query Time:</span>
                <span className="text-yellow-400 font-mono">{storageStats.mongodb.opsPerSecondLimit} ops/sec limit</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Endpoint Performance */}
      {endpointPerformance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-orange-400" />
            API Endpoint Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3">Endpoint</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Requests</th>
                  <th className="pb-3">Avg Response</th>
                  <th className="pb-3">P95 Response</th>
                  <th className="pb-3">Error Rate</th>
                  <th className="pb-3">Last Accessed</th>
                </tr>
              </thead>
              <tbody>
                {endpointPerformance.slice(0, 10).map((ep, index) => (
                  <tr key={index} className="border-b border-slate-700/50">
                    <td className="py-3 text-white font-mono text-xs">{ep.endpoint}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                        ep.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                        ep.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                        ep.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-3 text-indigo-400 font-mono">{ep.totalRequests.toLocaleString()}</td>
                    <td className="py-3 text-green-400 font-mono">{ep.averageResponseTime}ms</td>
                    <td className="py-3 text-yellow-400 font-mono">{ep.p95ResponseTime}ms</td>
                    <td className="py-3">
                      <span className={`font-mono ${
                        ep.errorRate > 5 ? 'text-red-400' :
                        ep.errorRate > 2 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {ep.errorRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-xs">
                      {new Date(ep.lastAccessed).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Health Summary */}
      {healthSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-4"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Server className="w-5 h-5 text-blue-400" />
              <div className={`flex items-center space-x-1 ${getHealthColor(healthSummary.healthScore)}`}>
                {getHealthIcon(healthSummary.healthScore)}
              </div>
            </div>
            <div className="text-2xl font-bold text-white capitalize">{healthSummary.healthScore}</div>
            <div className="text-xs text-slate-400">Current Health</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-xs text-green-400">{healthSummary.uptime.toFixed(1)}%</span>
            </div>
            <div className="text-2xl font-bold text-white">{healthSummary.uptime.toFixed(1)}%</div>
            <div className="text-xs text-slate-400">Uptime (7 days)</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span className="text-xs text-indigo-400">{healthSummary.current?.requests?.currentMinute || 0}/min</span>
            </div>
            <div className="text-2xl font-bold text-white">{healthSummary.current?.requests?.total?.toLocaleString() || 0}</div>
            <div className="text-xs text-slate-400">Total Requests</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className={`text-xs ${healthSummary.totalIncidents > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {healthSummary.totalIncidents > 0 ? `${healthSummary.totalIncidents} issues` : 'No issues'}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{healthSummary.totalIncidents}</div>
            <div className="text-xs text-slate-400">Incidents (7 days)</div>
          </div>
        </motion.div>
      )}

      {/* Peak Usage Times */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-slate-400" />
          Peak Usage Times
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3">Date</th>
                <th className="pb-3">Peak Requests/min</th>
                <th className="pb-3">Peak Time</th>
                <th className="pb-3">CPU Peak</th>
                <th className="pb-3">Memory Peak</th>
                <th className="pb-3">Health</th>
              </tr>
            </thead>
            <tbody>
              {peakData.slice(0, 10).map((peak, index) => (
                <tr key={index} className="border-b border-slate-700/50">
                  <td className="py-3 text-white">
                    {new Date(peak.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-indigo-400 font-mono">
                    {peak.peakRequestsPerMinute}
                  </td>
                  <td className="py-3 text-slate-300">
                    {peak.peakRequestTime ? 
                      new Date(peak.peakRequestTime).toLocaleTimeString() : 
                      'N/A'
                    }
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 font-mono">{peak.cpu.peakUsage}%</span>
                      <span className="text-xs text-slate-500">
                        {peak.cpu.peakTime ? 
                          new Date(peak.cpu.peakTime).toLocaleTimeString() : 
                          ''
                        }
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400 font-mono">{peak.memory.peakUsage}%</span>
                      <span className="text-xs text-slate-500">
                        {peak.memory.peakTime ? 
                          new Date(peak.memory.peakTime).toLocaleTimeString() : 
                          ''
                        }
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className={`flex items-center space-x-1 ${getHealthColor('good')}`}>
                      {getHealthIcon('good')}
                      <span className="text-sm">Good</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Daily Usage Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-slate-400" />
          Daily Usage Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3">Date</th>
                <th className="pb-3">Requests</th>
                <th className="pb-3">Avg Response</th>
                <th className="pb-3">P95 Response</th>
                <th className="pb-3">CPU</th>
                <th className="pb-3">Memory</th>
                <th className="pb-3">Error Rate</th>
                <th className="pb-3">Bandwidth</th>
                <th className="pb-3">Health</th>
              </tr>
            </thead>
            <tbody>
              {usageData.map((day, index) => (
                <tr key={index} className="border-b border-slate-700/50">
                  <td className="py-3 text-white">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-indigo-400 font-mono">
                    {day.totalRequests.toLocaleString()}
                  </td>
                  <td className="py-3 text-green-400 font-mono">
                    {day.averageResponseTime}ms
                  </td>
                  <td className="py-3 text-yellow-400 font-mono">
                    {day.p95ResponseTime}ms
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${(day.cpu?.averageUsage ?? 0) > 80 ? 'bg-red-500' : (day.cpu?.averageUsage ?? 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${day.cpu?.averageUsage ?? 0}%` }}
                        />
                      </div>
                      <span className="text-blue-400 font-mono text-xs">{day.cpu?.averageUsage ?? 0}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${(day.memory?.averageUsage ?? 0) > 80 ? 'bg-red-500' : (day.memory?.averageUsage ?? 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${day.memory?.averageUsage ?? 0}%` }}
                        />
                      </div>
                      <span className="text-purple-400 font-mono text-xs">{day.memory?.averageUsage ?? 0}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`font-mono ${
                      (day.errors?.errorRate ?? 0) > 5 ? 'text-red-400' :
                      (day.errors?.errorRate ?? 0) > 2 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {(day.errors?.errorRate ?? 0).toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-mono">
                    {formatBytes(day.network.totalBandwidth * 1024 * 1024)}
                  </td>
                  <td className="py-3">
                    <div className={`flex items-center space-x-1 ${getHealthColor(day.health?.overall ?? 'fair')}`}>
                      {getHealthIcon(day.health?.overall ?? 'fair')}
                      <span className="text-sm capitalize">{day.health?.overall ?? 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
