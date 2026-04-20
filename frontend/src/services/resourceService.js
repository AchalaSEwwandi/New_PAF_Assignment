import api from './api';

/**
 * Get all resources with optional filters
 * @param {Object} params - {type, location, minCapacity, status}
 */
export const getAllResources = async (params) => {
  const response = await api.get('/api/resources', { params });
  return response.data;
};

/**
 * Get a single resource by ID
 * @param {string} id 
 */
export const getResourceById = async (id) => {
  const response = await api.get(`/api/resources/${id}`);
  return response.data;
};

/**
 * Create a new resource
 * @param {Object} data - Resource data
 */
export const createResource = async (data) => {
  const response = await api.post('/api/resources', data);
  return response.data;
};

/**
 * Update an existing resource
 * @param {string} id 
 * @param {Object} data - Updated resource data
 */
export const updateResource = async (id, data) => {
  const response = await api.put(`/api/resources/${id}`, data);
  return response.data;
};

/**
 * Delete a resource
 * @param {string} id 
 */
export const deleteResource = async (id) => {
  const response = await api.delete(`/api/resources/${id}`);
  return response.data;
};

export default {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
};
