import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiLogOut, FiHome, FiBox, FiCalendar, FiFileText, FiTool, FiUser, FiSettings } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';

export default function StudentDashboard({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const jwt = localStorage.getItem('jwt');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    if (activeTab === 'Facilities') {
      setLoadingResources(true);
      fetch('http://localhost:8082/api/resources', { headers: { Authorization: 'Bearer ' + jwt } })
        .then(res => res.json())
        .then(data => {
          setResources(data);
          setLoadingResources(false);
        })
        .catch(err => {
          setResourceError('Failed to load resources');
          setLoadingResources(false);
        });
    }
  }, [activeTab, jwt]);

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

  const mainNavItems = [
    { name: 'Dashboard', icon: <FiHome size={18} /> },
    { name: 'Facilities', icon: <FiBox size={18} /> },
    { name: 'My Bookings', icon: <FiCalendar size={18} />, badge: 2 },
    { name: 'My Schedule', icon: <FiFileText size={18} /> },
    { name: 'Report Issue', icon: <FiTool size={18} /> },
    { name: 'Notifications', icon: <FiBell size={18} />, badge: 3 },
  ];

  const accountNavItems = [
    { name: 'My Profile', icon: <FiUser size={18} /> },
    { name: 'Settings', icon: <FiSettings size={18} /> },
  ];

  const comingSoonTabs = ['My Bookings', 'My Schedule', 'Report Issue', 'Notifications', 'My Profile', 'Settings'];

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-dm-sans">
      {/* Sidebar - Matching #6a0dad theme */}
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
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.name
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.name
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

                </div>
              </div>

            </div>
          )}

          {activeTab === 'Facilities' && (
            <div className="max-w-[1200px] mx-auto space-y-6">
              
              {/* Filter Bar */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-wrap gap-4">
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20">
                  <option value="">All Types</option>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Lab</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
                <input type="text" placeholder="Search resources..." value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20 flex-1 min-w-[200px]" />
                <input type="number" placeholder="Min capacity..." value={capacityFilter}
                  onChange={e => setCapacityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm w-36 focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20" />
              </div>

              {/* Loading / Error */}
              {loadingResources && <p className="text-center text-gray-400 py-12">Loading resources...</p>}
              {resourceError && <p className="text-center text-red-500 py-12">{resourceError}</p>}

              {/* Resource Cards Grid */}
              {!loadingResources && !resourceError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {resources
                    .filter(r => !typeFilter || r.type === typeFilter)
                    .filter(r => {
                      if (!searchFilter) return true;
                      const q = searchFilter.toLowerCase();
                      return r.name?.toLowerCase().includes(q) || 
                             r.location?.toLowerCase().includes(q) || 
                             r.building?.toLowerCase().includes(q) ||
                             r.type?.toLowerCase().includes(q) ||
                             r.description?.toLowerCase().includes(q);
                    })
                    .filter(r => !capacityFilter || r.capacity >= parseInt(capacityFilter))
                    .map(resource => (
                      <div key={resource.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-syne font-bold text-gray-800 text-[16px]">{resource.name}</h3>
                            <p className="text-gray-400 text-sm mt-1">{resource.building} {resource.floor ? '· Floor ' + resource.floor : ''}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="px-3 py-1 bg-[#6a0dad]/10 text-[#6a0dad] text-[11px] font-bold rounded-full uppercase tracking-wide">
                              {resource.type?.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-tight ${
                              resource.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                              resource.status === 'OUT_OF_SERVICE' ? 'bg-red-100 text-red-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {resource.status?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span>👥 {resource.capacity} {resource.type === 'EQUIPMENT' ? 'Units' : 'Persons'}</span>
                          <span>📍 {resource.location}</span>
                        </div>

                        {resource.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {resource.amenities.map((a, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-500 text-[11px] rounded-lg">{a}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3 mt-4">
                          <button onClick={() => setSelectedResource(resource)} className="flex-1 py-2 border-2 border-[#6a0dad] text-[#6a0dad] rounded-xl text-sm font-semibold hover:bg-[#6a0dad]/5 transition">
                            View Availability
                          </button>
                          <button 
                            onClick={() => {
                              if (resource.status === 'ACTIVE') {
                                // Original booking logic - don't change
                                window.location.href = '/bookings/book/' + resource.id;
                              } else {
                                alert(`This resource is currently ${resource.status?.replace('_', ' ')}. You can only book ACTIVE resources.`);
                              }
                            }}
                            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                              resource.status === 'ACTIVE' 
                                ? 'bg-[#6a0dad] text-white hover:bg-[#5a0b9d]' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Empty State */}
              {!loadingResources && !resourceError && resources.length === 0 && (
                <div className="text-center py-16 text-gray-400">No resources found.</div>
              )}

              {/* View Availability Modal */}
              {selectedResource && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  onClick={() => setSelectedResource(null)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-start justify-between shrink-0">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resource Availability Calendar</p>
                        <h2 className="font-bold text-2xl text-gray-900">{selectedResource.name}</h2>
                        <p className="text-gray-400 text-sm mt-1">
                          {selectedResource.type?.replace('_', ' ')} · {selectedResource.building} · {selectedResource.location}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Capacity: {selectedResource.capacity} {selectedResource.type === 'EQUIPMENT' ? 'Units' : 'Persons'} | Concurrent reservations allowed until all units are booked
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          selectedResource.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          selectedResource.status === 'OUT_OF_SERVICE' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{selectedResource.status?.replace('_', ' ')}</span>
                        <button onClick={() => setSelectedResource(null)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg font-bold transition flex-shrink-0">×</button>
                      </div>
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="px-8 py-3 border-b border-gray-100 flex gap-2 shrink-0">
                      {['Available', 'Booked', 'Limited Availability', 'Out of Service'].map(tab => (
                        <span key={tab} className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                          tab === 'Available' ? 'bg-green-100 text-green-700' :
                          tab === 'Booked' ? 'bg-gray-800 text-white' :
                          tab === 'Limited Availability' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>{tab}</span>
                      ))}
                    </div>

                    {selectedResource.status !== 'ACTIVE' && (
                      <div className="px-8 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                          <FiTool size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-red-700 font-bold">
                            Resource Unavailable
                          </p>
                          <p className="text-xs text-red-600 mt-0.5">
                            This resource is currently {selectedResource.status?.replace('_', ' ')}. Bookings and availability windows are suspended until further notice.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Calendar Grid */}
                    <div className="overflow-auto min-h-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-24">TIME</th>
                            {['Mon, Apr 20', 'Tue, Apr 21', 'Wed, Apr 22', 'Thu, Apr 23', 'Fri, Apr 24', 'Sat, Apr 25'].map(day => (
                              <th key={day} className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const timeSlots = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];
                            const days = [
                              { label: 'Mon, Apr 20', key: 'MON' },
                              { label: 'Tue, Apr 21', key: 'TUE' },
                              { label: 'Wed, Apr 22', key: 'WED' },
                              { label: 'Thu, Apr 23', key: 'THU' },
                              { label: 'Fri, Apr 24', key: 'FRI' },
                              { label: 'Sat, Apr 25', key: 'SAT' },
                            ];

                            const windows = selectedResource.availabilityWindows || [];
                            const resourceStatus = selectedResource.status;

                            const isWindowCovered = (dayKey, timeLabel) => {
                              const hour = parseInt(timeLabel.split(':')[0]);
                              const isPM = timeLabel.includes('PM') && hour !== 12;
                              const hour24 = isPM ? hour + 12 : (timeLabel.includes('12:00 PM') ? 12 : hour);

                              return windows.some(w => {
                                const dayMatch =
                                  w.day === dayKey ||
                                  w.day === 'DAILY' ||
                                  (w.day === 'MON-FRI' && ['MON','TUE','WED','THU','FRI'].includes(dayKey)) ||
                                  (w.day === 'MON-SAT' && ['MON','TUE','WED','THU','FRI','SAT'].includes(dayKey));

                                if (!dayMatch) return false;

                                const [startH, startM] = (w.startTime || '00:00').split(':').map(Number);
                                const [endH, endM] = (w.endTime || '23:59').split(':').map(Number);
                                const start24 = startH + startM / 60;
                                const end24 = endH + endM / 60;

                                return hour24 >= start24 && hour24 < end24;
                              });
                            };

                            const getSlotInfo = (dayKey, timeLabel) => {
                              if (resourceStatus === 'OUT_OF_SERVICE') {
                                return { type: 'out', label: 'Out of Service', sub: 'Resource not in operation' };
                              }
                              if (resourceStatus === 'UNDER_MAINTENANCE') {
                                return { type: 'limited', label: 'Maintenance', sub: 'Under maintenance' };
                              }
                              const covered = isWindowCovered(dayKey, timeLabel);
                              if (covered) {
                                return { type: 'available', label: 'Available', sub: 'Available for booking' };
                              }
                              return { type: 'unavailable', label: 'Unavailable', sub: 'Outside hours' };
                            };

                            return timeSlots.map((time) => (
                              <tr key={time} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                <td className="px-6 py-3 text-xs font-bold text-gray-400 whitespace-nowrap">{time}</td>
                                {days.map(({ label, key }) => {
                                  const slot = getSlotInfo(key, time);
                                  return (
                                    <td key={label} className="px-3 py-2 text-center">
                                      {slot.type === 'available' && (
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-[10px] text-green-600 font-bold">Available</span>
                                          <span className="text-[9px] text-gray-400 leading-tight">{slot.sub}</span>
                                        </div>
                                      )}
                                      {slot.type === 'limited' && (
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-[10px] text-orange-500 font-bold">Maintenance</span>
                                          <span className="text-[9px] text-gray-400 leading-tight">{slot.sub}</span>
                                        </div>
                                      )}
                                      {slot.type === 'out' && (
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-[10px] text-red-400 font-bold">Unavailable</span>
                                          <span className="text-[9px] text-gray-300 leading-tight">Out of service</span>
                                        </div>
                                      )}
                                      {slot.type === 'unavailable' && (
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-[10px] text-gray-300 font-bold">—</span>
                                          <span className="text-[9px] text-gray-200 leading-tight">Not scheduled</span>
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 border-t border-gray-100 flex justify-end shrink-0">
                      <button onClick={() => setSelectedResource(null)}
                        className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
