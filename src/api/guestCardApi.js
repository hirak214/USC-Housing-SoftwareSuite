import axios from 'axios';

const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const requestsApi = {
  getPending: () => api.get('/api/requests?pending=true'),
  getAll: () => api.get('/api/requests'),
  create: (requestData) => {
    // Handle both old format (string) and new format (object)
    if (typeof requestData === 'string') {
      return api.post('/api/requests', { name: requestData });
    }
    return api.post('/api/requests', requestData);
  },
  getById: (id) => api.get(`/api/requests?id=${id}`),
  updateStatus: (id, status) => api.put(`/api/requests?id=${id}`, { status }),
  delete: (id) => api.delete(`/api/requests?id=${id}`),
};

export const cardsApi = {
  assign: (cardNumber, userName, requestId, userEmail = null, userPhone = null) =>
    api.post('/api/cards?action=assign', { cardNumber, userName, requestId, userEmail, userPhone }),
  unassign: (cardNumber) =>
    api.post('/api/cards?action=unassign', { cardNumber }),
  getStatus: (cardNumber) =>
    api.get(`/api/cards?cardNumber=${cardNumber}`),
};

export const logsApi = {
  getAll: () => api.get('/api/logs'),
};

export default api;
