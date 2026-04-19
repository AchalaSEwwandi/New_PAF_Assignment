import api from './api';

const ticketService = {
  // ================================================================
  // STUDENT endpoints (unchanged)
  // ================================================================

  createTicket: (ticketData) => api.post('/api/tickets', ticketData),
  getMyTickets: () => api.get('/api/tickets/my'),
  getTicketById: (ticketId) => api.get(`/api/tickets/${ticketId}`),
  getComments: (ticketId) => api.get(`/api/tickets/${ticketId}/comments`),
  addComment: (ticketId, content) =>
    api.post(`/api/tickets/${ticketId}/comments`, { content }),
  updateStatus: (ticketId, status, resolutionNotes, rejectionReason) =>
    api.put(`/api/tickets/${ticketId}/status`, { status, resolutionNotes, rejectionReason }),
  assignTechnician: (ticketId, technicianEmail) =>
    api.put(`/api/tickets/${ticketId}/assign`, { technicianEmail }),

  // ================================================================
  // ADMIN endpoints (unchanged)
  // ================================================================

  adminGetAllTickets: () => api.get('/api/admin/tickets'),
  adminGetTicketById: (ticketId) => api.get(`/api/admin/tickets/${ticketId}`),
  adminGetTechnicians: () => api.get('/api/admin/tickets/technicians'),
  adminAssignTechnician: (ticketId, technicianEmail) =>
    api.patch(`/api/admin/tickets/${ticketId}/assign-technician`, { technicianEmail }),
  adminUpdateStatus: (ticketId, status, resolutionNotes, rejectionReason) =>
    api.patch(`/api/admin/tickets/${ticketId}/status`, { status, resolutionNotes, rejectionReason }),
  adminRejectTicket: (ticketId, reason) =>
    api.patch(`/api/admin/tickets/${ticketId}/reject`, { reason }),

  // ================================================================
  // TECHNICIAN endpoints
  // ================================================================

  // GET /api/technician/tickets/my — tickets assigned to the logged-in technician
  techGetMyTickets: () => api.get('/api/technician/tickets/my'),

  // GET /api/technician/tickets/{id} — single assigned ticket
  techGetTicketById: (ticketId) => api.get(`/api/technician/tickets/${ticketId}`),

  // GET /api/technician/tickets/{id}/comments
  techGetComments: (ticketId) => api.get(`/api/technician/tickets/${ticketId}/comments`),

  // PATCH /api/technician/tickets/{id}/status — { status, resolutionNotes }
  techUpdateStatus: (ticketId, status, resolutionNotes) =>
    api.patch(`/api/technician/tickets/${ticketId}/status`, { status, resolutionNotes }),

  // PATCH /api/technician/tickets/{id}/resolution — { resolutionNotes }
  techSetResolution: (ticketId, resolutionNotes) =>
    api.patch(`/api/technician/tickets/${ticketId}/resolution`, { resolutionNotes }),

  // POST /api/tickets/{id}/comments — shared endpoint (tech can comment via this)
  techAddComment: (ticketId, content) =>
    api.post(`/api/tickets/${ticketId}/comments`, { content }),

  // GET /api/technician/tickets/completed — RESOLVED + CLOSED
  techGetCompleted: () => api.get('/api/technician/tickets/completed'),

  // GET /api/technician/tickets/history — all handled
  techGetHistory: () => api.get('/api/technician/tickets/history'),
};

export default ticketService;
