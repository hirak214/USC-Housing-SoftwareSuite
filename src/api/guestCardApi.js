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
  create: (name) => api.post('/api/requests', { name }),
  getById: (id) => api.get(`/api/requests?id=${id}`),
  updateStatus: (id, status) => api.put(`/api/requests?id=${id}`, { status }),
};

export const cardsApi = {
  assign: (cardNumber, userName, requestId) =>
    api.post('/api/cards?action=assign', { cardNumber, userName, requestId }),
  unassign: (cardNumber) =>
    api.post('/api/cards?action=unassign', { cardNumber }),
  getStatus: (cardNumber) =>
    api.get(`/api/cards?cardNumber=${cardNumber}`),
};

export const logsApi = {
  getAll: () => api.get('/api/logs'),
};

export default api;
