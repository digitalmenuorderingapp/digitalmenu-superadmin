import api from './api';

export const superadminService = {
  /**
   * Request OTP for superadmin login
   */
  requestOTP: async (email: string) => {
    const response = await api.post('/superadmin/send-otp', { email });
    return response.data;
  },

  /**
   * Verify OTP and login
   */
  verifyOTP: async (email: string, otp: string) => {
    const response = await api.post('/superadmin/verify-otp', { email, otp });
    return response.data;
  },
  /**
   * Superadmin logout
   */
  logout: async () => {
    const response = await api.post('/superadmin/logout');
    return response.data;
  },

  /**
   * Refresh superadmin token
   */
  refresh: async () => {
    const response = await api.post('/superadmin/refresh');
    return response.data;
  },

  /**
   * Get Real-time System Metrics (CPU, Memory, Requests)
   */
  getSystemStats: async () => {
    const response = await api.get('/superadmin/system-stats');
    return response.data;
  },

  /**
   * Check Status of External Services & Internal Systems
   */
  getServiceStatus: async () => {
    const response = await api.get('/superadmin/service-status');
    return response.data;
  },

  /**
   * Get Dashboard Analytics & Trend Data
   */
  getAnalytics: async () => {
    const response = await api.get('/superadmin/analytics');
    return response.data;
  },

  /**
   * Get all registered users (restaurants) with enriched data
   */
  getUsers: async () => {
    const response = await api.get('/superadmin/users');
    return response.data;
  },

  /**
   * Get Platform-wide Orders Overview (Aggregate stats)
   */
  getOrdersOverview: async () => {
    const response = await api.get('/superadmin/orders-overview');
    return response.data;
  },

  /**
   * Get Detail of a Single User (Restaurant)
   */
  getUserDetail: async (id: string) => {
    const response = await api.get(`/superadmin/user/${id}`);
    return response.data;
  },

  /**
   * Get current superadmin profile
   */
  me: async () => {
    const response = await api.get('/superadmin/me');
    return response.data;
  },

  /**
   * Update user account status
   */
  updateUserStatus: async (userId: string, status: 'active' | 'inactive') => {
    const response = await api.patch(`/superadmin/users/${userId}/status`, { status });
    return response.data;
  },

  /**
   * Update user subscription details
   */
  updateSubscription: async (userId: string, data: { 
    subscription: {
      type: 'free' | 'paid',
      status: 'active' | 'inactive' | 'expired',
      startDate?: string | Date,
      expiryDate: string | null
    } 
  }) => {
    const response = await api.patch(`/superadmin/users/${userId}/subscription`, data);
    return response.data;
  },

  /**
   * Get system audit logs
   */
  getAuditLogs: async (params?: { type?: string, status?: string, search?: string, page?: number, limit?: number }) => {
    const response = await api.get('/superadmin/logs', { params });
    return response.data;
  }
};
