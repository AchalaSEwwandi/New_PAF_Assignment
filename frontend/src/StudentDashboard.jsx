import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiLogOut, FiHome, FiBox, FiCalendar, FiFileText, FiTool, FiUser, FiSettings, FiList, FiEye } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import CreateTicket from './pages/tickets/CreateTicket';
import TicketList from './pages/tickets/TicketList';
import TicketDetails from './pages/tickets/TicketDetails';

export default function StudentDashboard({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const jwt = localStorage.getItem('jwt');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!jwt) {
      setCurrentPage('signin');
      return;
    }
  }, [jwt, setCurrentPage]);

  const fullName = user.fullName || user.username || 'Student User';
  const firstName = fullName.split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Navigate to ticket details
  const handleViewTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActiveTab('Ticket Details');
  };

  // Navigate back to My Tickets list
  const handleBackToList = () => {
    setSelectedTicketId(null);
    setActiveTab('My Tickets');
  };

  // After creating ticket, go to My Tickets
  const handleTicketCreated = () => {
    setActiveTab('My Tickets');
  };

  const mainNavItems = [
    { name: 'Dashboard', icon: <FiHome size={18} /> },
    { name: 'Facilities', icon: <FiBox size={18} /> },
    { name: 'My Bookings', icon: <FiCalendar size={18} />, badge: 2 },
    { name: 'My Schedule', icon: <FiFileText size={18} /> },
    // Ticket section
    { name: 'Report Issue', icon: <FiTool size={18} /> },
    { name: 'My Tickets', icon: <FiList size={18} /> },
    { name: 'Notifications', icon: <FiBell size={18} />, badge: 3 },
  ];

  const accountNavItems = [
    { name: 'My Profile', icon: <FiUser size={18} /> },
    { name: 'Settings', icon: <FiSettings size={18} /> },
  ];

  // Tabs that are "coming soon" (no implementation yet)
  const comingSoonTabs = ['Facilities', 'My Bookings', 'My Schedule', 'Notifications', 'My Profile', 'Settings'];

  // Determine if we're inside a ticket view for sidebar highlighting
  const ticketTabs = ['Report Issue', 'My Tickets', 'Ticket Details'];
  const sidebarActive = ticketTabs.includes(activeTab) ? activeTab : activeTab;

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-dm-sans">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#3a0760] text-white flex flex-col pt-6 pb-6 shadow-xl z-10 shrink-0 border-r border-[#6a0dad]/30">

        {/* Logo Section */}
        <div className="px-6 flex items-center gap-3 mb-8 cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-[#6a0dad] flex items-center justify-center">
            <BiBuildingHouse size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-syne font-semibold text-[15px] leading-tight tracking-wide">Smart Campus</h1>
            <p className="text-[#d8b4fe] text-[12px]">Student Portal</p>
          </div>
        </div>

        {/* Navigation Wrapper */}
        <div className="flex-1 overflow-y-auto px-4 mt-2">

          <div className="mb-6">
            <h3 className="px-4 text-[11px] font-bold text-[#d8b4fe] uppercase tracking-wider mb-3">Main</h3>
            <ul className="space-y-1">
              {mainNavItems.map(item => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      setActiveTab(item.name);
                      if (item.name !== 'Ticket Details') setSelectedTicketId(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.name || (item.name === 'My Tickets' && activeTab === 'Ticket Details')
                        ? 'bg-[#6a0dad] text-white font-semibold'
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
            <h3 className="px-4 text-[11px] font-bold text-[#d8b4fe] uppercase tracking-wider mb-3">Account</h3>
            <ul className="space-y-1">
              {accountNavItems.map(item => (
                <li key={item.name}>
                  <button
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.name
                        ? 'bg-[#6a0dad] text-white font-semibold'
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
            <span className="text-[14px]">Logout from portal</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Header */}
        <header className="h-[76px] bg-[#f9fafb] border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-syne text-[20px] font-bold text-gray-800">
            {activeTab === 'Ticket Details' ? '← Ticket Details' : activeTab}
          </h2>

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
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
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

          {/* ========== DASHBOARD ========== */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-8 max-w-[1200px] mx-auto">
              {/* Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[#18181b] via-[#27272a] to-[#6a0dad]/80 p-8 text-white relative overflow-hidden shadow-lg border border-gray-800">
                <div className="relative z-10">
                  <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Welcome,</p>
                  <h2 className="font-syne text-3xl font-bold mb-2 flex items-center gap-2">
                    {fullName} <span role="img" aria-label="wave">👋</span>
                  </h2>
                  <p className="text-gray-300">Ready to explore your student portal?</p>
                </div>
                <div className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <FiUser className="text-[#a78bfa]" size={24} />
                </div>
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute right-40 top-0 w-48 h-48 bg-[#6a0dad]/40 rounded-full blur-3xl -translate-y-1/2"></div>
              </div>

              {/* Modules Grid */}
              <div className="pb-8">
                <h3 className="font-syne text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Links</h3>
                <div className="grid grid-cols-3 gap-6">

                  <div onClick={() => setActiveTab('Facilities')} className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <FiBox className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">View Facilities</h4>
                    <p className="text-sm text-gray-400">Browse campus facilities and resources easily.</p>
                  </div>

                  <div onClick={() => setActiveTab('My Bookings')} className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <FiCalendar className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">My Bookings</h4>
                    <p className="text-sm text-gray-400">Request ad-hoc resource bookings for clubs or study sessions.</p>
                  </div>

                  <div onClick={() => setActiveTab('Report Issue')} className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <FiTool className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">Report an Issue</h4>
                    <p className="text-sm text-gray-400">Help keep the campus safe by reporting maintenance issues.</p>
                  </div>

                  <div onClick={() => setActiveTab('My Tickets')} className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <FiList className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">My Tickets</h4>
                    <p className="text-sm text-gray-400">Track the status of all your submitted tickets.</p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ========== REPORT ISSUE (CreateTicket) ========== */}
          {activeTab === 'Report Issue' && (
            <div className="max-w-[1200px] mx-auto">
              <CreateTicket
                onSuccess={handleTicketCreated}
                onCancel={() => setActiveTab('Dashboard')}
              />
            </div>
          )}

          {/* ========== MY TICKETS (TicketList) ========== */}
          {activeTab === 'My Tickets' && (
            <div className="max-w-[1200px] mx-auto">
              <TicketList
                onViewDetails={handleViewTicket}
                onCreateNew={() => setActiveTab('Report Issue')}
              />
            </div>
          )}

          {/* ========== TICKET DETAILS ========== */}
          {activeTab === 'Ticket Details' && selectedTicketId && (
            <div className="max-w-[1200px] mx-auto">
              <TicketDetails
                ticketId={selectedTicketId}
                onBack={handleBackToList}
              />
            </div>
          )}

          {/* ========== COMING SOON ========== */}
          {comingSoonTabs.includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24">
              <div className="w-20 h-20 bg-[#6a0dad]/10 rounded-2xl flex items-center justify-center mb-6">
                <FiBox className="text-[#6a0dad]" size={36} />
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
