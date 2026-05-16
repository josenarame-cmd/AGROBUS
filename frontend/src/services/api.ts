import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrobus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agrobus_token');
      localStorage.removeItem('agrobus_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
};

// Farmers
export const farmerAPI = {
  getAll: () => api.get('/farmers/all'),
  search: (params: any) => api.get('/farmers', { params }),
  getById: (id: number) => api.get(`/farmers/${id}`),
  create: (data: any) => api.post('/farmers', data),
  update: (id: number, data: any) => api.put(`/farmers/${id}`, data),
  delete: (id: number) => api.delete(`/farmers/${id}`),
  getDistricts: () => api.get('/farmers/districts'),
  getCropTypes: () => api.get('/farmers/crop-types'),
  getUnassigned: () => api.get('/farmers/unassigned'),
};

// Loans
export const loanAPI = {
  getAll: (params: any) => api.get('/loans', { params }),
  getById: (id: number) => api.get(`/loans/${id}`),
  create: (data: any) => api.post('/loans', data),
  approve: (id: number) => api.put(`/loans/${id}/approve`),
  reject: (id: number, reason: string) => api.put(`/loans/${id}/reject`, { reason }),
  deliver: (id: number) => api.put(`/loans/${id}/deliver`),
  getByStatus: (status: string, params: any) => api.get(`/loans/status/${status}`, { params }),
  getByFarmer: (farmerId: number) => api.get(`/loans/farmer/${farmerId}`),
  getRecent: (params: any) => api.get('/loans/recent', { params }),
};

// Inputs
export const inputAPI = {
  getAll: () => api.get('/inputs'),
  getById: (id: number) => api.get(`/inputs/${id}`),
  create: (data: any) => api.post('/inputs', data),
  update: (id: number, data: any) => api.put(`/inputs/${id}`, data),
  delete: (id: number) => api.delete(`/inputs/${id}`),
  getByCategory: (category: string) => api.get(`/inputs/category/${category}`),
  getLowStock: () => api.get('/inputs/low-stock'),
  distribute: (id: number, quantity: number) => api.post(`/inputs/${id}/distribute`, { quantity }),
};

// Agents
export const agentAPI = {
  getAll: () => api.get('/agents'),
  getById: (id: number) => api.get(`/agents/${id}`),
  create: (data: any) => api.post('/agents', data),
  update: (id: number, data: any) => api.put(`/agents/${id}`, data),
  delete: (id: number) => api.delete(`/agents/${id}`),
  assignFarmer: (agentId: number, farmerId: number) => api.post(`/agents/${agentId}/assign-farmer`, { farmerId }),
  getAssignedFarmers: (agentId: number) => api.get(`/agents/${agentId}/farmers`),
};

// Repayments
export const repaymentAPI = {
  getAll: () => api.get('/repayments'),
  record: (data: any) => api.post('/repayments', data),
  getByLoan: (loanId: number) => api.get(`/repayments/loan/${loanId}`),
  getByFarmer: (farmerId: number) => api.get(`/repayments/farmer/${farmerId}`),
  getTotal: () => api.get('/repayments/total'),
};

// Notifications
export const notificationAPI = {
  getAll: (params: any) => api.get('/notifications', { params }),
  getUnread: (userId: number) => api.get(`/notifications/unread/${userId}`),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  getUnreadCount: (userId: number) => api.get(`/notifications/unread-count/${userId}`),
};

// Dashboard
export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

export default api;
