'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Search, 
  RefreshCw, 
  Check, 
  X,
  Clock,
  Filter,
  Calendar
} from 'lucide-react';
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

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState({ type: 'all', status: 'all', search: '' });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await superadminService.getAuditLogs({
        type: logFilter.type,
        status: logFilter.status,
        search: logFilter.search,
        limit: 50 // Increased limit for dedicated page
      });
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Audit Logs</h1>
          <p className="text-slate-400">Track all administrative actions and system events</p>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Audit Logs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Activity History</h3>
            {logsLoading && <RefreshCw className="w-4 h-4 text-slate-500 animate-spin ml-2" />}
          </div>
          <button 
            onClick={() => fetchAuditLogs()}
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center space-x-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={logFilter.search}
              onChange={(e) => setLogFilter(prev => ({ ...prev, search: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs()}
              className="bg-slate-900/50 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-64 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={logFilter.type}
              onChange={(e) => setLogFilter(prev => ({ ...prev, type: e.target.value }))}
              className="bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:border-indigo-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="auth">Auth Events</option>
              <option value="user">User Management</option>
              <option value="order">Order Activity</option>
              <option value="system">System Events</option>
              <option value="settings">Settings Changes</option>
            </select>
          </div>
          <select
            value={logFilter.status}
            onChange={(e) => setLogFilter(prev => ({ ...prev, status: e.target.value }))}
            className="bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:border-indigo-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="success">Success Only</option>
            <option value="failed">Failed Only</option>
          </select>
          <button 
            onClick={fetchAuditLogs}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3 px-2 font-semibold">Time</th>
                <th className="pb-3 px-2 font-semibold">Type</th>
                <th className="pb-3 px-2 font-semibold">Action</th>
                <th className="pb-3 px-2 font-semibold">User</th>
                <th className="pb-3 px-2 font-semibold">IP Address</th>
                <th className="pb-3 px-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 px-2 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 opacity-50" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.type === 'auth' ? 'bg-blue-500/10 text-blue-400' :
                        log.type === 'system' ? 'bg-purple-500/10 text-purple-400' :
                        log.type === 'user' ? 'bg-green-500/10 text-green-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-white font-medium">{log.action}</td>
                    <td className="py-4 px-2 text-slate-300">{log.user}</td>
                    <td className="py-4 px-2 text-slate-500 font-mono text-xs">{log.ip}</td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-1">
                        {log.status === 'success' ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-green-500 text-xs">Success</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 text-xs">Failed</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <Shield className="w-12 h-12 mb-3 opacity-20" />
                      <p>No activity logs found for the selected filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
