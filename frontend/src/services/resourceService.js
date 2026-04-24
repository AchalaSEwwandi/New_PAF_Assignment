import api from './api';

/**
 * Get all resources with optional filters
 * @param {Object} params - {type, location, minCapacity, status}
 */
export const getAllResources = async (params) => {
  return await api.get('/api/resources', { params });
};

/**
 * Get a single resource by ID
 * @param {string} id 
 */
export const getResourceById = async (id) => {
  return await api.get(`/api/resources/${id}`);
};

/**
 * Create a new resource
 * @param {Object} data - Resource data
 */
export const createResource = async (data) => {
  return await api.post('/api/resources', data);
};

/**
 * Update an existing resource
 * @param {string} id 
 * @param {Object} data - Updated resource data
 */
export const updateResource = async (id, data) => {
  return await api.put(`/api/resources/${id}`, data);
};

/**
 * Delete a resource
 * @param {string} id 
 */
export const deleteResource = async (id) => {
  return await api.delete(`/api/resources/${id}`);
};
//export functions
export default {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
};
