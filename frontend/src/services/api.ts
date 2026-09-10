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

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:         (data: { email: string; password: string }) => api.post('/auth/login', data),
  register:      (data: { fullName: string; email: string; password: string; phone?: string }) =>
                   api.post('/auth/register', data),
  getProfile:    () => api.get('/auth/me'),
  updateProfile: (data: { fullName: string; phone?: string }) => api.put('/auth/profile', data),
};

// ── Farmers (ADMIN / AGENT) ─────────────────────────────────────────────────
export const farmerAPI = {
  getAll:       () => api.get('/farmers/all'),
  search:       (params: Record<string, unknown>) => api.get('/farmers', { params }),
  getById:      (id: number) => api.get(`/farmers/${id}`),
  create:       (data: unknown) => api.post('/farmers', data),
  update:       (id: number, data: unknown) => api.put(`/farmers/${id}`, data),
  delete:       (id: number) => api.delete(`/farmers/${id}`),
  getDistricts: () => api.get('/farmers/districts'),
  getCropTypes: () => api.get('/farmers/crop-types'),
  getUnassigned:() => api.get('/farmers/unassigned'),
  linkUser:     (farmerId: number, userId: number) =>
                   api.put(`/farmers/${farmerId}/link-user`, { userId }),
};

// ── Farmer self-service (FARMER role) ───────────────────────────────────────
export const farmAPI = {
  getMine: () => api.get('/farmer/farms'),
  create:  (data: unknown) => api.post('/farmer/farms', data),
  update:  (id: number, data: unknown) => api.put(`/farmer/farms/${id}`, data),
  remove:  (id: number) => api.delete(`/farmer/farms/${id}`),
};

export const farmerSelfAPI = {
  getDashboard:       () => api.get('/farmer/dashboard'),
  getMyLoans:         () => api.get('/farmer/loans'),
  getMyRepayments:    () => api.get('/farmer/repayments'),
  getMyNotifications: () => api.get('/farmer/notifications'),
  getAllMyNotifications: (params?: { page?: number; size?: number }) =>
                           api.get('/farmer/notifications/all', { params }),
};

// ── Loans (ADMIN / AGENT) ───────────────────────────────────────────────────
export const loanAPI = {
  getAll:      (params?: Record<string, unknown>) => api.get('/loans', { params }),
  getById:     (id: number) => api.get(`/loans/${id}`),
  /**
   * @param data { farmerId, cropType, requestedInputs, quantity?,
   *               estimatedCost, farmSize?, season? }
   */
  create:      (data: unknown) => api.post('/loans', data),
  approve:     (id: number) => api.put(`/loans/${id}/approve`),
  reject:      (id: number, reason: string) => api.put(`/loans/${id}/reject`, { reason }),
  deliver:     (id: number) => api.put(`/loans/${id}/deliver`),
  getByStatus: (status: string, params?: Record<string, unknown>) =>
                 api.get(`/loans/status/${status}`, { params }),
  getByFarmer: (farmerId: number) => api.get(`/loans/farmer/${farmerId}`),
  getRecent:   (params?: Record<string, unknown>) => api.get('/loans/recent', { params }),
};

// ── Agricultural Inputs (ADMIN / AGENT) ─────────────────────────────────────
export const inputAPI = {
  getAll:       () => api.get('/inputs'),
  getById:      (id: number) => api.get(`/inputs/${id}`),
  create:       (data: unknown) => api.post('/inputs', data),
  update:       (id: number, data: unknown) => api.put(`/inputs/${id}`, data),
  delete:       (id: number) => api.delete(`/inputs/${id}`),
  getByCategory:(category: string) => api.get(`/inputs/category/${category}`),
  getLowStock:  () => api.get('/inputs/low-stock'),
  distribute:   (id: number, quantity: number) =>
                  api.post(`/inputs/${id}/distribute`, { quantity }),
};

// ── Agents (ADMIN / AGENT) ──────────────────────────────────────────────────
export const agentAPI = {
  getAll:           () => api.get('/agents'),
  getById:          (id: number) => api.get(`/agents/${id}`),
  create:           (data: unknown) => api.post('/agents', data),
  update:           (id: number, data: unknown) => api.put(`/agents/${id}`, data),
  delete:           (id: number) => api.delete(`/agents/${id}`),
  assignFarmer:     (agentId: number, farmerId: number) =>
                      api.post(`/agents/${agentId}/assign-farmer`, { farmerId }),
  getAssignedFarmers:(agentId: number) => api.get(`/agents/${agentId}/farmers`),
};

// ── Repayments (ADMIN / AGENT) ───────────────────────────────────────────────
export const repaymentAPI = {
  getAll:      () => api.get('/repayments'),
  record:      (data: unknown) => api.post('/repayments', data),
  getByLoan:   (loanId: number) => api.get(`/repayments/loan/${loanId}`),
  getByFarmer: (farmerId: number) => api.get(`/repayments/farmer/${farmerId}`),
  getTotal:    () => api.get('/repayments/total'),
};

// ── Suppliers (ADMIN / AGENT) ────────────────────────────────────────────────
export const supplierAPI = {
  getAll:    () => api.get('/suppliers'),
  getActive: () => api.get('/suppliers/active'),
  getById:   (id: number) => api.get(`/suppliers/${id}`),
  create:    (data: unknown) => api.post('/suppliers', data),
  update:    (id: number, data: unknown) => api.put(`/suppliers/${id}`, data),
  delete:    (id: number) => api.delete(`/suppliers/${id}`),
};

// ── Notifications (ADMIN / AGENT) ────────────────────────────────────────────
export const notificationAPI = {
  getAll:        (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  getUnread:     (userId: number) => api.get(`/notifications/unread/${userId}`),
  markAsRead:    (id: number) => api.put(`/notifications/${id}/read`),
  getUnreadCount:(userId: number) => api.get(`/notifications/unread-count/${userId}`),
};

// ── Dashboard (ADMIN / AGENT) ────────────────────────────────────────────────
export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

export default api;
