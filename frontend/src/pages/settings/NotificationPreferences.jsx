import React, { useState, useEffect } from 'react';
import { FiBell, FiCheckCircle, FiSave } from 'react-icons/fi';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    bookingUpdates: true,
    ticketUpdates: true,
    newComments: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    fetch('http://localhost:8082/api/users/notification-preferences', {
      headers: { Authorization: 'Bearer ' + jwt }
    })
      .then(res => res.json())
      .then(data => {
        setPreferences(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load preferences', err);
        setLoading(false);
      });
  }, [jwt]);

  const handleToggle = (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    savePreferences(updated);
  };

  const savePreferences = (updatedPrefs) => {
    setSaving(true);
    setMessage('');
    
    fetch('http://localhost:8082/api/users/notification-preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt
      },
      body: JSON.stringify(updatedPrefs)
    })
      .then(res => res.json())
      .then(data => {
        setSaving(false);
        setMessage('Preferences saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(err => {
        console.error('Failed to save preferences', err);
        setSaving(false);
      });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading preferences...</div>;
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center">
          <FiBell className="text-[#6a0dad]" size={24} />
        </div>
        <div>
          <h2 className="font-syne font-bold text-xl text-gray-800">Notification Preferences</h2>
          <p className="text-sm text-gray-400">Choose which updates you want to receive</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Booking Updates */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
          <div>
            <h4 className="font-bold text-gray-700">Booking Updates</h4>
            <p className="text-xs text-gray-400">Get notified when your facility bookings are approved or rejected</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={preferences.bookingUpdates} 
              onChange={() => handleToggle('bookingUpdates')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6a0dad]"></div>
          </label>
        </div>

        {/* Ticket Updates */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
          <div>
            <h4 className="font-bold text-gray-700">Ticket Updates</h4>
            <p className="text-xs text-gray-400">Receive status changes on your maintenance tickets</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={preferences.ticketUpdates} 
              onChange={() => handleToggle('ticketUpdates')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6a0dad]"></div>
          </label>
        </div>

        {/* New Comments */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
          <div>
            <h4 className="font-bold text-gray-700">New Comments</h4>
            <p className="text-xs text-gray-400">Stay updated when technicians comment on your tickets</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={preferences.newComments} 
              onChange={() => handleToggle('newComments')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6a0dad]"></div>
          </label>
        </div>
      </div>

      {message && (
        <div className="mt-8 flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-xl border border-green-100 animate-fade-in">
          <FiCheckCircle />
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      <div className="mt-8 text-[11px] text-gray-400 text-center">
        Preferences are updated instantly as you toggle them.
      </div>
    </div>
  );
}
