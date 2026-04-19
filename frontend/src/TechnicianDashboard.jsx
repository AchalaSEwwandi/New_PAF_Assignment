import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiLogOut, FiHome, FiTag, FiMap, FiCheckSquare, FiBarChart2, FiFileText } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';

export default function TechnicianDashboard({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const jwt = localStorage.getItem('jwt');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!jwt) {
      setCurrentPage('signin');
      return;
    }
  }, [jwt, setCurrentPage]);

  const fullName = user.fullName || user.username || 'Mike Torres';
  const firstName = fullName.split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const mainNavItems = [
    { name: 'Dashboard', icon: <FiHome size={18} /> },
    { name: 'My Tickets', icon: <FiTag size={18} />, badge: 5 },
    { name: 'Campus Map', icon: <FiMap size={18} /> },
    { name: 'Completed', icon: <FiCheckSquare size={18} /> },
    { name: 'Notifications', icon: <FiBell size={18} />, badge: 2 },
  ];

  const reportNavItems = [
    { name: 'Work Report', icon: <FiBarChart2 size={18} /> },
    { name: 'History', icon: <FiFileText size={18} /> },
  ];

  const comingSoonTabs = ['My Tickets', 'Campus Map', 'Completed', 'Notifications', 'Work Report', 'History'];

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-dm-sans">
      {/* Sidebar - Matching #6a0dad theme */}
      <div className="w-[280px] bg-[#3a0760] text-white flex flex-col pt-6 pb-6 shadow-xl z-10 shrink-0 border-r border-[#6a0dad]/30">

        {/* Profile Card / Header */}
        <div className="px-5 mb-8 relative">
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#6a0dad]/20 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#6a0dad] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-[15px] truncate text-[#f8fafc]">{fullName}</p>
              <span className="inline-block px-3 py-0.5 mt-1 bg-[#6a0dad] text-white text-[11px] font-bold rounded-full tracking-wide">
                Technician
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Wrapper */}
        <div className="flex-1 overflow-y-auto px-4">
          
          <div className="mb-6">
            <h3 className="px-4 text-[11px] font-bold text-[#d8b4fe] uppercase tracking-wider mb-3">Main</h3>
            <ul className="space-y-1">
              {mainNavItems.map(item => (
                <li key={item.name}>
                  <button
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.name
                        ? 'bg-[#6a0dad] text-white font-semibold shadow-sm'
                        : 'text-[#d8b4fe]/70 hover:text-white hover:bg-[#6a0dad]/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${activeTab === item.name ? 'text-white' : ''}`}>{item.icon}</span>
                      <span className="text-[14px]">{item.name}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="bg-[#ef4444] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none">{item.badge}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="px-4 text-[11px] font-bold text-[#d8b4fe] uppercase tracking-wider mb-3">Reports</h3>
            <ul className="space-y-1">
              {reportNavItems.map(item => (
                <li key={item.name}>
                  <button
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.name
                        ? 'bg-[#6a0dad] text-white font-semibold outline outline-1 outline-[#6a0dad]/20 shadow-sm'
                        : 'text-[#d8b4fe]/70 hover:text-white hover:bg-[#6a0dad]/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${activeTab === item.name ? 'text-white' : ''}`}>{item.icon}</span>
                      <span className="text-[14px]">{item.name}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4 mt-auto pt-6 border-t border-[#6a0dad]/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ef4444] hover:bg-[#ef4444]/10 transition-all font-medium"
          >
            <FiLogOut size={18} />
            <span className="text-[14px]">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Header */}
        <header className="h-[76px] bg-[#f9fafb] border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-syne text-[20px] font-bold text-gray-800">{activeTab}</h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20 focus:border-[#6a0dad] w-[240px] transition-all"
              />
            </div>

            <button className="relative text-gray-500 hover:text-gray-700 transition">
              <FiBell size={20} />
              {mainNavItems.find(i => i.name === 'Notifications')?.badge > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>

            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-50 transition">
              <div className="w-6 h-6 rounded-full bg-[#6a0dad] flex items-center justify-center text-white font-bold text-[10px]">
                {initial}
              </div>
              <span className="text-sm font-medium pr-1 text-gray-700">{firstName}</span>
            </div>
          </div>
        </header>

        {/* Main Scrolling Area */}
        <div className="flex-1 overflow-y-auto p-8">

          {activeTab === 'Dashboard' && (
            <div className="space-y-8 max-w-[1200px] mx-auto">
              {/* Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[#18181b] via-[#27272a] to-[#6a0dad]/80 p-8 text-white relative overflow-hidden shadow-lg border border-gray-800">
                <div className="relative z-10">
                  <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Welcome back,</p>
                  <h2 className="font-syne text-3xl font-bold mb-2 flex items-center gap-2">
                    {fullName} <span role="img" aria-label="wave">👋</span>
                  </h2>
                  <p className="text-gray-300">Ready to tackle today's maintenance tickets?</p>
                </div>
                <div className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <FiCheckSquare className="text-[#a78bfa]" size={24} />
                </div>
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute right-40 top-0 w-48 h-48 bg-[#6a0dad]/40 rounded-full blur-3xl -translate-y-1/2"></div>
              </div>

              {/* Modules Grid */}
              <div className="pb-8">
                <h3 className="font-syne text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Links</h3>
                <div className="grid grid-cols-3 gap-6">

                  <div onClick={() => setActiveTab('My Tickets')} className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <FiTag className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">My Tickets</h4>
                    <p className="text-sm text-gray-400">View and update your assigned facility issues and work orders.</p>
                  </div>

                  <div onClick={() => setActiveTab('Campus Map')} className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <FiMap className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">Campus Map</h4>
                    <p className="text-sm text-gray-400">Locate resources, labs and classrooms across the campus grounds.</p>
                  </div>

                  <div onClick={() => setActiveTab('Completed')} className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <FiCheckSquare className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">Completed Work</h4>
                    <p className="text-sm text-gray-400">Review your past completed maintenance work and reports.</p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {comingSoonTabs.includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24">
              <div className="w-20 h-20 bg-[#6a0dad]/10 rounded-2xl flex items-center justify-center mb-6">
                <FiTag className="text-[#6a0dad]" size={36} />
              </div>
              <h2 className="font-syne text-2xl font-bold text-gray-800 mb-3">{activeTab}</h2>
              <p className="text-gray-400 text-sm max-w-sm">This module is currently under development by the team. Check back soon!</p>
              <span className="mt-6 px-4 py-2 bg-[#6a0dad]/10 text-[#6a0dad] text-sm font-semibold rounded-full">Coming Soon</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
