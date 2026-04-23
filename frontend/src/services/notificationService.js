import api from './api';

const notificationService = {
  getNotifications: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
  clearAll: () => api.delete('/api/notifications/clear-all'),
};

export default notificationService;
