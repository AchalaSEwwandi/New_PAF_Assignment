import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

/**
 * BookResource — works in two modes:
 *  1. Embedded inside StudentDashboard (props: resourceId, onBack, onSuccess)
 *  2. Standalone route /bookings/book/:id (uses useParams, useNavigate)
 */
const BookResource = ({ resourceId: propResourceId, onBack, onSuccess }) => {
  const params = useParams();
  const navigate = useNavigate();
  const resourceId = propResourceId || params.id;

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    purpose: '',
    startTime: '',
    endTime: '',
    numberOfPeople: '',
    notes: '',
  });

  useEffect(() => {
    if (!resourceId) return;
    setLoading(true);
    api.get(`/api/resources/${resourceId}`)
      .then(data => {
        setResource(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load resource details.');
        setLoading(false);
      });
  }, [resourceId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.startTime || !form.endTime) {
      setError('Please select start and end times.');
      return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setError('End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/bookings', {
        resourceId,
        title: form.title,
        purpose: form.purpose,
        startTime: form.startTime,
        endTime: form.endTime,
        numberOfPeople: parseInt(form.numberOfPeople) || 1,
        notes: form.notes,
      });
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else navigate('/bookings');
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-[#6a0dad]/20 border-t-[#6a0dad] rounded-full animate-spin" />
    </div>
  );

  if (success) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">✅</span>
      </div>
      <h2 className="font-syne text-2xl font-bold text-gray-800 mb-2">Booking Submitted!</h2>
      <p className="text-gray-400 text-sm">Your booking request has been submitted and is pending approval.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="font-syne text-2xl font-bold text-gray-800">Book Resource</h1>
          <p className="text-gray-400 text-sm">Fill in the details to request a booking</p>
        </div>
      </div>

      {/* Resource Info Card */}
      {resource && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-2xl">🏛️</span>
          </div>
          <div>
            <h3 className="font-syne font-bold text-gray-800 text-lg">{resource.name}</h3>
            <p className="text-gray-400 text-sm mt-0.5">
              {resource.type?.replace('_', ' ')} · {resource.building} · {resource.location}
            </p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>👥 Capacity: {resource.capacity} {resource.type === 'EQUIPMENT' ? 'Units' : 'Persons'}</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {resource.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="font-syne font-bold text-gray-800 text-lg mb-6">Booking Details</h2>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Booking Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Study Group Session"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20 focus:border-[#6a0dad]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Purpose / Description *
            </label>
            <textarea
              name="purpose"
              required
              rows={3}
              value={form.purpose}
              onChange={handleChange}
              placeholder="Briefly describe the purpose of the booking..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20 focus:border-[#6a0dad]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Start Date &amp; Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                required
                value={form.startTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20 focus:border-[#6a0dad]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                End Date &amp; Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                required
                value={form.endTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20 focus:border-[#6a0dad]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Number of People
            </label>
            <input
              type="number"
              name="numberOfPeople"
              min="1"
              max={resource?.capacity || 999}
              value={form.numberOfPeople}
              onChange={handleChange}
              placeholder={`Max ${resource?.capacity || '—'}`}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20 focus:border-[#6a0dad]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              placeholder="Any special requirements or notes..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20 focus:border-[#6a0dad]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#6a0dad] text-white rounded-xl text-sm font-semibold hover:bg-[#5a0b9d] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookResource;
