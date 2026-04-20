import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import * as resourceService from '../../services/resourceService';

const ResourceList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    type: 'ALL',
    status: 'ALL',
    search: '',
    minCapacity: ''
  });

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.type !== 'ALL') params.type = filters.type;
      if (filters.status !== 'ALL') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.minCapacity) params.minCapacity = filters.minCapacity;

      const data = await resourceService.getAllResources(params);
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch resources. Please try again later.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.deleteResource(id);
        fetchResources();
      } catch (err) {
        alert('Failed to delete resource. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800';
      case 'UNDER_MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 text-gray-900">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => window.location.href = '/admin'} className="mt-1 p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Campus Resources</h1>
            <p className="text-gray-500 mt-1">Manage and monitor all campus facilities and equipment in real-time.</p>
          </div>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/resources/add')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Resource
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Resource Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
          >
            <option value="ALL">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Laboratory</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Availability Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Search Resources</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search anything..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Minimum Capacity</label>
          <input
            type="number"
            placeholder="Min people..."
            value={filters.minCapacity}
            onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl shadow-sm border border-gray-50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="mt-6 text-gray-500 font-bold tracking-wide uppercase text-xs">Synchronizing resources...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-3xl flex items-center gap-4 animate-pulse">
          <div className="bg-red-100 p-2 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg">Data Retrieval Error</p>
            <p className="opacity-80">{error}</p>
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg font-medium">No resources found match your specific filters.</p>
          <button 
            onClick={() => setFilters({ type: 'ALL', status: 'ALL', search: '', minCapacity: '' })}
            className="mt-4 text-indigo-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <div key={resource.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-gray-900 text-xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{resource.name}</h3>
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    {resource.type}
                  </span>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-600 font-medium">
                    <div className="bg-gray-50 p-2 rounded-lg mr-4 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-sm">{resource.building}, {resource.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 font-medium">
                    <div className="bg-gray-50 p-2 rounded-lg mr-4 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="text-sm">
                      Capacity: {resource.capacity} {resource.type === 'EQUIPMENT' ? 'Units' : 'Persons'}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-50">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-widest uppercase inline-block shadow-sm ${getStatusBadgeColor(resource.status)}`}>
                      {resource.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {user?.role === 'ADMIN' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => navigate(`/resources/edit/${resource.id}`)}
                      className="flex-1 bg-white border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 text-gray-700 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="flex-1 bg-white border border-gray-200 hover:border-red-600 hover:text-red-600 text-gray-700 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <svg className="w-4 h-4 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceList;
