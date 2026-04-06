import api from './api';

export interface SuperadminService {
  requestOTP: (email: string) => Promise<any>;
  verifyOTP: (email: string, otp: string) => Promise<any>;
  autoLogin: () => Promise<any>;
  logout: () => Promise<any>;
  refresh: () => Promise<any>;
  getSystemStats: () => Promise<any>;
  getServiceStatus: () => Promise<any>;
  getAnalytics: () => Promise<any>;
  getRestaurants: () => Promise<any>;
  getUsers: () => Promise<any>;
  getOrdersOverview: () => Promise<any>;
  getRestaurantDetail: (id: string) => Promise<any>;
  me: () => Promise<any>;
  updateRestaurantStatus: (restaurantId: string, status: 'active' | 'inactive') => Promise<any>;
  updateSubscription: (restaurantId: string, data: any) => Promise<any>;
  getAuditLogs: (params?: any) => Promise<any>;
  getCloudinaryStats: () => Promise<any>;
  triggerMonthlyReports: (restaurantIds?: string[]) => Promise<any>;
}

export const superadminService: SuperadminService = {
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
   * Auto-login (bypass OTP for development)
   */
  autoLogin: async () => {
    const response = await api.post('/superadmin/auto-login');
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
   * Get all registered restaurants with enriched data
   */
  getRestaurants: async () => {
    const response = await api.get('/superadmin/restaurants');
    return response.data;
  },

  /**
   * Get all users (Alias for getRestaurants to support Subscription page)
   */
  getUsers: async () => {
    const response = await api.get('/superadmin/restaurants');
    return {
      success: response.data.success,
      users: response.data.restaurants
    };
  },

  /**
   * Get Platform-wide Orders Overview (Aggregate stats)
   */
  getOrdersOverview: async () => {
    const response = await api.get('/superadmin/orders-overview');
    return response.data;
  },

  /**
   * Get Detail of a Single Restaurant
   */
  getRestaurantDetail: async (id: string) => {
    const response = await api.get(`/superadmin/restaurant/${id}`);
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
   * Update restaurant account status
   */
  updateRestaurantStatus: async (restaurantId: string, status: 'active' | 'inactive') => {
    const response = await api.patch(`/superadmin/restaurants/${restaurantId}/status`, { status });
    return response.data;
  },

  /**
   * Update restaurant subscription details
   */
  updateSubscription: async (restaurantId: string, data: { 
    subscription: {
      type: 'free' | 'paid',
      status: 'active' | 'inactive' | 'expired',
      startDate?: string | Date,
      expiryDate: string | null
    } 
  }) => {
    const response = await api.patch(`/superadmin/restaurants/${restaurantId}/subscription`, data);
    return response.data;
  },

  /**
   * Get system audit logs
   */
  getAuditLogs: async (params?: { type?: string, status?: string, search?: string, page?: number, limit?: number }) => {
    const response = await api.get('/superadmin/logs', { params });
    return response.data;
  },

  /**
   * Get Cloudinary usage stats
   */
  getCloudinaryStats: async () => {
    const response = await api.get('/superadmin/cloudinary-stats');
    return response.data;
  },

  /**
   * Manually trigger monthly reports for all or selected restaurants (1st-5th only)
   */
  triggerMonthlyReports: async (restaurantIds?: string[]) => {
    const response = await api.post('/superadmin/trigger-monthly-reports', { restaurantIds });
    return response.data;
  }
};
