import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as resourceService from '../../services/resourceService';

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    location: '',
    status: '',
    description: '',
    amenities: '',
    building: '',
    floor: ''
  });

  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await resourceService.getResourceById(id);
        
        // Extract availability windows if they exist
        if (data.availabilityWindows && data.availabilityWindows.length > 0) {
          const window = data.availabilityWindows[0];
          setAvailableFrom(window.startTime || '');
          setAvailableTo(window.endTime || '');
        }

        setFormData({
          name: data.name || '',
          type: data.type || '',
          capacity: data.capacity || '',
          location: data.location || '',
          status: data.status || '',
          description: data.description || '',
          amenities: data.amenities ? data.amenities.join(', ') : '',
          building: data.building || '',
          floor: data.floor || ''
        });
      } catch (err) {
        setError('Failed to load resource details. The resource might not exist or the server is unreachable.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: false });
    }

    if (name === 'type') {
      setFormData({
        ...formData,
        type: value,
        location: '' // Reset location when type changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'capacity' ? (value ? parseInt(value) : '') : value
      });
    }
  };

  const handleTimeChange = (type, value) => {
    if (type === 'from') {
      setAvailableFrom(value);
      if (formErrors.availableFrom) setFormErrors({ ...formErrors, availableFrom: false });
    } else {
      setAvailableTo(value);
      if (formErrors.availableTo) setFormErrors({ ...formErrors, availableTo: false });
    }
  };

  const getLocationOptions = () => {
    switch (formData.type) {
      case 'LECTURE_HALL':
        return [
          { value: 'Block A Hall 1', label: 'Block A Hall 1' },
          { value: 'Block A Hall 2', label: 'Block A Hall 2' },
          { value: 'Block B Auditorium', label: 'Block B Auditorium' }
        ];
      case 'LAB':
        return [
          { value: 'Computer Lab 1', label: 'Computer Lab 1' },
          { value: 'Computer Lab 2', label: 'Computer Lab 2' },
          { value: 'Physics Lab', label: 'Physics Lab' },
          { value: 'Chemistry Lab', label: 'Chemistry Lab' }
        ];
      case 'MEETING_ROOM':
        return [
          { value: 'Conference Room A', label: 'Conference Room A' },
          { value: 'Conference Room B', label: 'Conference Room B' },
          { value: 'Board Room', label: 'Board Room' }
        ];
      case 'EQUIPMENT':
        return [
          { value: 'Projector Room', label: 'Projector Room' },
          { value: 'Camera Studio', label: 'Camera Studio' },
          { value: 'AV Equipment Store', label: 'AV Equipment Store' }
        ];
      default:
        return [];
    }
  };

  const locationOptions = getLocationOptions();

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = true;
    if (!formData.type) errors.type = true;
    if (!formData.capacity) errors.capacity = true;
    if (!formData.location) errors.location = true;
    if (!formData.status) errors.status = true;
    if (!formData.building.trim()) errors.building = true;
    if (!availableFrom) errors.availableFrom = true;
    if (!availableTo) errors.availableTo = true;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Please fill all required fields highlighting in red.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const windows = (availableFrom && availableTo) ? [{
        day: 'MON-FRI',
        startTime: availableFrom,
        endTime: availableTo
      }] : [];

      const processedData = {
        ...formData,
        amenities: formData.amenities
          ? formData.amenities.split(',').map(item => item.trim()).filter(item => item !== '')
          : [],
        availabilityWindows: windows
      };

      await resourceService.updateResource(id, processedData);
      navigate('/resources');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update resource. Please check your input.');
      console.error('Update error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError) => `w-full bg-gray-100 border-2 rounded-full px-5 py-3 text-gray-700 focus:ring-2 focus:ring-[#6a0dad]/20 focus:bg-white transition ${hasError ? 'border-red-500' : 'border-transparent'}`;
  const selectClass = (hasError) => `appearance-none w-full bg-gray-100 border-2 rounded-full px-5 py-3 text-gray-700 focus:ring-2 focus:ring-[#6a0dad]/20 focus:bg-white transition cursor-pointer ${hasError ? 'border-red-500' : 'border-transparent'}`;
  const textareaClass = "w-full bg-gray-100 border-0 rounded-2xl px-5 py-3 text-gray-700 focus:ring-2 focus:ring-[#6a0dad]/20 focus:bg-white transition resize-none";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const errorText = <p className="text-red-500 text-[10px] mt-1 ml-4 font-bold uppercase tracking-wider">This field is required</p>;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#e3f2fd] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6a0dad]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#e3f2fd] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl w-full bg-white p-10 rounded-3xl shadow-md relative">
        <button 
          type="button"
          onClick={() => navigate('/resources')} 
          className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center group"
          title="Back to Resources"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Resource</h2>
          <p className="text-gray-500 mt-1">Updating details for <span className="font-bold text-[#6a0dad]">{formData.name}</span></p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {/* 1. Resource Name */}
          <div>
            <label htmlFor="name" className={labelClass}>Resource Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={inputClass(formErrors.name)}
              placeholder="Enter resource name"
            />
            {formErrors.name && errorText}
          </div>

          {/* 2. Type and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="type" className={labelClass}>Resource Type</label>
              <div className="relative">
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={selectClass(formErrors.type)}
                >
                  <option value="" disabled>Select type</option>
                  <option value="LECTURE_HALL">LECTURE_HALL</option>
                  <option value="LAB">LAB</option>
                  <option value="MEETING_ROOM">MEETING_ROOM</option>
                  <option value="EQUIPMENT">EQUIPMENT</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {formErrors.type && errorText}
            </div>
            <div>
              <label htmlFor="capacity" className={labelClass}>Capacity</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                className={inputClass(formErrors.capacity)}
                placeholder="Enter capacity"
              />
              {formErrors.capacity && errorText}
            </div>
          </div>

          {/* 3. Campus Location */}
          <div>
            <label htmlFor="location" className={labelClass}>Campus Location</label>
            <div className="relative">
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!formData.type}
                className={selectClass(formErrors.location) + (!formData.type ? ' opacity-60' : '')}
              >
                {!formData.type ? (
                  <option value="" disabled>Select resource type first</option>
                ) : (
                  <>
                    <option value="" disabled>Select location</option>
                    {locationOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {formErrors.location && errorText}
            <p className="text-xs text-gray-500 mt-2">Location list updates automatically based on the selected resource type.</p>
          </div>

          {/* 4. Available From & To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="availableFrom" className={labelClass}>Available From</label>
              <input
                id="availableFrom"
                type="time"
                value={availableFrom}
                onChange={(e) => handleTimeChange('from', e.target.value)}
                className={inputClass(formErrors.availableFrom)}
              />
              {formErrors.availableFrom && errorText}
            </div>
            <div>
              <label htmlFor="availableTo" className={labelClass}>Available To</label>
              <input
                id="availableTo"
                type="time"
                value={availableTo}
                onChange={(e) => handleTimeChange('to', e.target.value)}
                className={inputClass(formErrors.availableTo)}
              />
              {formErrors.availableTo && errorText}
            </div>
          </div>

          {/* 5. Status */}
          <div>
            <label htmlFor="status" className={labelClass}>Status</label>
            <div className="relative">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={selectClass(formErrors.status)}
              >
                <option value="" disabled>Select status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {formErrors.status && errorText}
          </div>

          {/* 6. Description */}
          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className={textareaClass}
              placeholder="Enter short description"
            />
          </div>

          {/* 7. Amenities */}
          <div>
            <label htmlFor="amenities" className={labelClass}>Amenities</label>
            <input
              id="amenities"
              name="amenities"
              type="text"
              value={formData.amenities}
              onChange={handleChange}
              className={inputClass(false)}
              placeholder="e.g. Projector, AC, Whiteboard (comma separated)"
            />
          </div>

          {/* 8. Building */}
          <div>
            <label htmlFor="building" className={labelClass}>Building</label>
            <input
              id="building"
              name="building"
              type="text"
              value={formData.building}
              onChange={handleChange}
              className={inputClass(formErrors.building)}
              placeholder="Enter building name"
            />
            {formErrors.building && errorText}
          </div>

          {/* 9. Floor */}
          <div>
            <label htmlFor="floor" className={labelClass}>Floor</label>
            <input
              id="floor"
              name="floor"
              type="text"
              value={formData.floor}
              onChange={handleChange}
              className={inputClass(false)}
              placeholder="Enter floor (optional)"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="px-8 py-3 rounded-full border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-[#6a0dad] text-white font-semibold hover:bg-[#5a0b9d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6a0dad] focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-[#6a0dad]/20"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : 'Update Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditResource;
