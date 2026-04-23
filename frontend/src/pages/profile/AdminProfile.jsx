import React, { useState } from 'react';
import { FiUser, FiMail, FiShield, FiCalendar, FiEdit2, FiCamera, FiCheckCircle, FiLock, FiGlobe, FiPhone } from 'react-icons/fi';

export default function AdminProfile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  
  const fullName = user.fullName || user.username || 'Admin User';
  const email = user.email || 'admin@smartcampus.edu';
  const role = user.role || 'ADMIN';
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();

  const stats = [
    { label: 'Approvals', value: '124', color: 'text-emerald-500' },
    { label: 'Tickets Resolved', value: '45', color: 'text-blue-500' },
    { label: 'System Health', value: '98%', color: 'text-purple-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100">
        <div className="h-48 bg-gradient-to-r from-[#3a0760] via-[#6a0dad] to-[#8b5cf6] relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all">
            <FiCamera size={20} />
          </button>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex items-end -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-[#6a0dad] border-4 border-white shadow-2xl flex items-center justify-center text-white text-4xl font-bold font-syne">
                {initials}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg">
                <FiCheckCircle size={18} />
              </div>
            </div>
            
            <div className="ml-6 mb-2">
              <h1 className="text-3xl font-bold font-syne text-gray-800">{fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {role}
                </span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <FiGlobe size={14} /> Main Campus Hub
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="ml-auto mb-2 flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              <FiEdit2 size={16} />
              <span className="font-semibold text-sm">Edit Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <p className={`text-2xl font-bold ${stat.color} group-hover:scale-110 transition-transform`}>{stat.value}</p>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Personal Information */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h3 className="font-syne text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiUser className="text-[#6a0dad]" /> Account Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group focus-within:border-[#6a0dad]/50 focus-within:bg-white transition-all">
                  <FiUser className="text-gray-400 group-focus-within:text-[#6a0dad]" />
                  <input 
                    type="text" 
                    defaultValue={fullName}
                    disabled={!isEditing}
                    className="bg-transparent border-none focus:ring-0 text-gray-700 w-full font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group focus-within:border-[#6a0dad]/50 focus-within:bg-white transition-all">
                  <FiMail className="text-gray-400 group-focus-within:text-[#6a0dad]" />
                  <input 
                    type="email" 
                    defaultValue={email}
                    disabled={!isEditing}
                    className="bg-transparent border-none focus:ring-0 text-gray-700 w-full font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group focus-within:border-[#6a0dad]/50 focus-within:bg-white transition-all">
                  <FiPhone className="text-gray-400 group-focus-within:text-[#6a0dad]" />
                  <input 
                    type="text" 
                    defaultValue="+94 77 123 4567"
                    disabled={!isEditing}
                    className="bg-transparent border-none focus:ring-0 text-gray-700 w-full font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group focus-within:border-[#6a0dad]/50 focus-within:bg-white transition-all">
                  <FiLock className="text-gray-400 group-focus-within:text-[#6a0dad]" />
                  <input 
                    type="text" 
                    defaultValue="admin123"
                    disabled={!isEditing}
                    className="bg-transparent border-none focus:ring-0 text-gray-700 w-full font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Member Since</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <FiCalendar className="text-gray-400" />
                  <span className="text-gray-700 font-medium">January 2024</span>
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    alert('Profile updated successfully!');
                  }}
                  className="px-8 py-2.5 bg-[#6a0dad] text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-200 hover:bg-[#580b94] transition-all"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security & Preferences */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h3 className="font-syne text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiShield className="text-[#6a0dad]" /> Security
            </h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <FiLock size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Change Password</span>
                </div>
                <div className="text-gray-300 group-hover:text-gray-500 transition-colors">
                  <FiEdit2 size={14} />
                </div>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <FiShield size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Two-Factor Auth</span>
                </div>
                <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                  ACTIVE
                </div>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#18181b] to-[#2a2a2d] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-syne text-lg font-bold mb-2">Need Support?</h3>
              <p className="text-gray-400 text-sm mb-6">Contact the technical team for system assistance.</p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl font-bold text-sm transition-all">
                Submit Support Ticket
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6a0dad]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
