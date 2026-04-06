'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Server, 
  Cpu, 
  HardDrive, 
  Zap, 
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Users,
  Globe,
  Database,
  Cloud
} from 'lucide-react';
import api from '@/services/api';
import { superadminSocketService } from '@/services/superadmin-socket';

interface LiveStats {
  timestamp: string;
  requests: {
    total: number;
    currentMinute: number;
    peakPerMinute: number;
    peakTime: string | null;
  };
  performance: {
    averageResponseTime: number;
    activeConnections: number;
    errorRate: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    memoryUsed: number;
    memoryTotal: number;
    uptime: number;
    nodeVersion: string;
    platform: string;
  };
  network: {
    bandwidthUsed: number;
    activeConnections: number;
  };
}

export default function LiveStatsPage() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/superadmin/current-stats');
        
        if (response.data.success) {
          setStats(response.data.data);
          setError(null);
        } else {
          setError('Failed to fetch stats');
        }
      } catch (err: any) {
        console.error('Stats fetch error:', err);
        setError(err.response?.data?.message || 'Connection error');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStats();

    // Setup Sockets for real-time updates
    superadminSocketService.connect();
    superadminSocketService.join('superadmin');

    // Subscribe to server-specific statistics (CPU, RAM, API)
    superadminSocketService.on('serverStatsUpdate', (newStats: any) => {
      setStats(newStats);
    });

    return () => {
      superadminSocketService.off('serverStatsUpdate');
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getHealthColor = (value: number, type: 'cpu' | 'memory' | 'response' | 'error') => {
    const thresholds = {
      cpu: [70, 85, 95],
      memory: [70, 85, 95],
      response: [200, 500, 1000],
      error: [1, 3, 5]
    };
    
    const [good, warning, critical] = thresholds[type];
    
    if (value >= critical) return 'text-red-500';
    if (value >= warning) return 'text-orange-500';
    if (value >= good) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getHealthIcon = (value: number, type: 'cpu' | 'memory' | 'response' | 'error') => {
    const thresholds = {
      cpu: [70, 85, 95],
      memory: [70, 85, 95],
      response: [200, 500, 1000],
      error: [1, 3, 5]
    };
    
    const [good, warning, critical] = thresholds[type];
    
    if (value >= critical) return <AlertCircle className="w-4 h-4" />;
    if (value >= warning) return <AlertCircle className="w-4 h-4" />;
    if (value >= good) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-400">Loading live stats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Server Stats</h1>
          <p className="text-slate-400">Real-time server performance and usage metrics</p>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-indigo-400" />
            <span className="text-xs text-slate-500">LIVE</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{stats.requests.total.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Total Requests</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current/min:</span>
              <span className="text-indigo-400 font-mono">{stats.requests.currentMinute}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Peak/min:</span>
              <span className="text-yellow-400 font-mono">{stats.requests.peakPerMinute}</span>
            </div>
          </div>
        </motion.div>

        {/* Response Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-green-400" />
            <div className={`flex items-center space-x-1 ${getHealthColor(stats.performance.averageResponseTime, 'response')}`}>
              {getHealthIcon(stats.performance.averageResponseTime, 'response')}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{stats.performance.averageResponseTime}ms</div>
            <div className="text-sm text-slate-400">Avg Response Time</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Active:</span>
              <span className="text-green-400 font-mono">{stats.performance.activeConnections}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Error Rate:</span>
              <span className={`font-mono ${getHealthColor(stats.performance.errorRate, 'error')}`}>
                {stats.performance.errorRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* CPU Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Cpu className="w-8 h-8 text-blue-400" />
            <div className={`flex items-center space-x-1 ${getHealthColor(stats.system.cpuUsage, 'cpu')}`}>
              {getHealthIcon(stats.system.cpuUsage, 'cpu')}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{stats.system.cpuUsage}%</div>
            <div className="text-sm text-slate-400">CPU Usage</div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.system.cpuUsage > 85 ? 'bg-red-500' :
                  stats.system.cpuUsage > 70 ? 'bg-orange-500' :
                  stats.system.cpuUsage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${stats.system.cpuUsage}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Memory Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8 text-purple-400" />
            <div className={`flex items-center space-x-1 ${getHealthColor(stats.system.memoryUsage, 'memory')}`}>
              {getHealthIcon(stats.system.memoryUsage, 'memory')}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{stats.system.memoryUsage}%</div>
            <div className="text-sm text-slate-400">Memory Usage</div>
            <div className="text-xs text-slate-500">
              {stats.system.memoryUsed}MB / {stats.system.memoryTotal}MB
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.system.memoryUsage > 85 ? 'bg-red-500' :
                  stats.system.memoryUsage > 70 ? 'bg-orange-500' :
                  stats.system.memoryUsage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${stats.system.memoryUsage}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>


      {/* System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2 text-slate-400" />
            System Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Platform:</span>
              <span className="text-white font-mono">{stats.system.platform}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Node.js:</span>
              <span className="text-white font-mono">{stats.system.nodeVersion}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Uptime:</span>
              <span className="text-white font-mono">{formatUptime(stats.system.uptime)}</span>
            </div>
          </div>
        </motion.div>

        {/* Network Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-slate-400" />
            Network Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Bandwidth Used:</span>
              <span className="text-white font-mono">{stats.network.bandwidthUsed}MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Active Connections:</span>
              <span className="text-white font-mono">{stats.network.activeConnections}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-slate-400" />
            Performance Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Status:</span>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-400 font-mono">Healthy</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Peak Time:</span>
              <span className="text-white font-mono">
                {stats.requests.peakTime ? 
                  new Date(stats.requests.peakTime).toLocaleTimeString() : 
                  'N/A'
                }
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
