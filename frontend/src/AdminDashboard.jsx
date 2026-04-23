import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiLogOut, FiUsers, FiGrid, FiBox, FiCalendar, FiAlertCircle, FiTrendingUp, FiSettings, FiUser } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminBookings from './pages/bookings/AdminBookings';
import AdminTicketPanel from './pages/tickets/AdminTicketPanel';
import NotificationDropdown from './components/NotificationDropdown';
import NotificationsPage from './pages/notifications/NotificationsPage';
import NotificationPreferences from './pages/settings/NotificationPreferences';

export default function AdminDashboard({ setCurrentPage }) {
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Manage Users');
  const [approvalRoles, setApprovalRoles] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
  const jwt = localStorage.getItem('jwt');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUsers = () => {
    fetch('http://localhost:8082/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    })
      .then(async res => {
        if (!res.ok) {
           const text = await res.text();
           throw new Error(`API Error ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
           setUsers(data);
        } else {
           throw new Error('Data is not an array: ' + JSON.stringify(data));
        }
        setErrorMessage(null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setErrorMessage(err.message);
        setUsers([]);
        setLoading(false);
      });
  };

  const fetchResources = () => {
    fetch('http://localhost:8082/api/resources', {
      headers: { 'Authorization': `Bearer ${jwt}` }
    })
      .then(res => res.json())
      .then(data => setResources(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (!jwt) {
      setCurrentPage('signin');
      return;
    }
    fetchUsers();
    fetchResources();
  }, [jwt, setCurrentPage]);

  const handleRoleChange = (userId, role) => {
    setApprovalRoles({ ...approvalRoles, [userId]: role });
  };

  const handleApprove = (userId, role) => {
    fetch(`http://localhost:8082/api/admin/users/${userId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: role })
    })
      .then(res => {
        if (res.ok) {
          alert('User approved and notified via email');
          fetchUsers();
        } else {
          alert('Failed to approve user');
        }
      });
  };

  const handleReject = (userId) => {
    if (window.confirm("Are you sure you want to reject and remove this user?")) {
      fetch(`http://localhost:8082/api/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      })
        .then(res => {
          if (res.ok) {
            alert('User rejected and notified via email');
            fetchUsers();
          } else {
            alert('Failed to reject user');
          }
        });
    }
  };

  const fullName = user.fullName || user.username || 'Admin User';
  const firstName = fullName.split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING').length;

  const resourceTypes = ['EQUIPMENT', 'LAB', 'LECTURE_HALL', 'MEETING_ROOM'];
  const COLORS = ['#a855f7', '#22c55e', '#3b82f6', '#f59e0b'];
  const pieData = resourceTypes.map(type => ({
    name: type,
    value: resources.filter(r => r.type === type).length
  })).filter(d => d.value > 0);

  const navItems = [
    { name: 'Dashboard', icon: <FiGrid size={18} /> },
    { name: 'Manage Users', icon: <FiUsers size={18} />, badge: pendingUsers },
    { name: 'Resources', icon: <FiBox size={18} /> },
    { name: 'Bookings', icon: <FiCalendar size={18} /> },
    { name: 'Tickets', icon: <FiAlertCircle size={18} /> },
    { name: 'Notifications', icon: <FiBell size={18} />, badge: notifUnreadCount },
    { name: 'Profile', icon: <FiUser size={18} /> },
    { name: 'Settings', icon: <FiSettings size={18} /> },
  ];

  const comingSoonTabs = ['Resources', 'Profile'];

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-dm-sans">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#3a0760] text-white flex flex-col pt-6 pb-6 shadow-xl z-10 shrink-0">

        {/* Logo Section */}
        <div className="px-6 flex items-center gap-3 mb-8 cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-[#6a0dad] flex items-center justify-center">
            <BiBuildingHouse size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-syne font-semibold text-[15px] leading-tight tracking-wide">Smart Campus</h1>
            <p className="text-[#9ca3af] text-[12px]">Operations Hub</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-5 mb-8">
          <div className="bg-[#2a2a2d] rounded-xl p-3 flex items-center gap-3 border border-[#3f3f46]">
            <div className="w-10 h-10 rounded-full bg-[#6a0dad] flex items-center justify-center text-white font-bold text-lg">
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{fullName}</p>
              <p className="text-[#6a0dad] text-xs font-semibold">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation Wrapper */}
        <div className="flex-1 overflow-y-auto px-4">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.name}>
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.name
                      ? 'bg-[#6a0dad] text-white font-semibold shadow-sm'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#2a2a2d]/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-[14px]">{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none">{item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <div className="px-4 mt-auto pt-6 border-t border-[#2a2a2d]">
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

            <NotificationDropdown onUnreadCountChange={setNotifUnreadCount} />

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
                  <p className="text-gray-300">Here's your campus overview for today.</p>
                </div>
                <div className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <FiTrendingUp className="text-[#4ade80]" size={24} />
                </div>
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute right-40 top-0 w-48 h-48 bg-[#6a0dad]/40 rounded-full blur-3xl -translate-y-1/2"></div>
              </div>

              {/* Overview Stats */}
              <div>
                <h3 className="font-syne text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Overview</h3>
                <div className="grid grid-cols-4 gap-6">

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#6a0dad]/20 border-b-4 border-b-[#6a0dad] flex flex-col justify-between h-[150px]">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-auto">
                      <FiUsers className="text-blue-500" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800 mb-1">{users.length}</div>
                      <p className="text-sm font-bold text-gray-800">Total Users</p>
                      <p className="text-xs text-gray-400 mt-1">Registered users</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#6a0dad]/20 border-b-4 border-b-[#6a0dad] flex flex-col justify-between h-[150px]">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-auto">
                      <BiBuildingHouse className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800 mb-1">{resources.length}</div>
                      <p className="text-sm font-bold text-gray-800">Facilities</p>
                      <p className="text-xs text-gray-400 mt-1">Campus assets</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#6a0dad]/20 border-b-4 border-b-[#6a0dad] flex flex-col justify-between h-[150px]">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-auto">
                      <FiCalendar className="text-green-500" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800 mb-1">5</div>
                      <p className="text-sm font-bold text-gray-800">Booking Requests</p>
                      <p className="text-xs text-gray-400 mt-1">Pending approval</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#6a0dad]/20 border-b-4 border-b-[#6a0dad] flex flex-col justify-between h-[150px]">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-auto">
                      <FiAlertCircle className="text-red-500" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800 mb-1">2</div>
                      <p className="text-sm font-bold text-gray-800">Open Incidents</p>
                      <p className="text-xs text-gray-400 mt-1">Requiring attention</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Resource Types Pie Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-syne text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Resource Types</h3>
                {pieData.length === 0 ? (
                  <div className="py-12 flex justify-center text-gray-400">No resource data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, value }) => `${value}`}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[resourceTypes.indexOf(entry.name) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Modules Grid */}
              <div className="pb-8">
                <h3 className="font-syne text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Modules</h3>
                <div className="grid grid-cols-3 gap-6">

                  <div onClick={() => window.location.href = '/resources'} className="bg-white rounded-2xl p-8 border-2 border-dashed border-[#6a0dad]/30 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <BiBuildingHouse className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">Facilities & Assets</h4>
                    <p className="text-sm text-gray-400">Manage campus buildings, rooms, and equipment. Module is ready!</p>
                  </div>

                  <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-[#6a0dad]/30 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <FiCalendar className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">Booking Requests</h4>
                    <p className="text-sm text-gray-400">Review and approve resource booking requests from students and staff.</p>
                  </div>

                  <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-[#6a0dad]/30 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4">
                      <FiAlertCircle className="text-[#6a0dad]" size={24} />
                    </div>
                    <h4 className="font-syne font-bold text-gray-800 mb-2">Incident Tickets</h4>
                    <p className="text-sm text-gray-400">Track and resolve campus facility incidents and maintenance requests.</p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {activeTab === 'Manage Users' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-[1200px] mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-syne text-lg font-bold text-gray-800">User Registrations</h3>
                <button
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-[#f3f4f6] hover:bg-gray-200 text-sm font-medium text-gray-700 rounded-lg transition"
                >
                  Refresh Data
                </button>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center text-gray-400">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#6a0dad]/20 bg-[#6a0dad] text-white">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-tl-lg">User Details</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {errorMessage ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-red-500 font-bold">
                            Error loading users: {errorMessage}
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No users found.</td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-[#f9fafb] transition group duration-200">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">{user.fullName || user.username}</span>
                                <span className="text-sm text-gray-500">{user.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${user.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {user.status === 'PENDING' ? (
                                <div className="flex items-center gap-2">
                                  <select 
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]"
                                    value={approvalRoles[user.id] || user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  >
                                    <option value="STUDENT">Student</option>
                                    <option value="LECTURER">Lecturer</option>
                                    <option value="TECHNICIAN">Technician</option>
                                  </select>
                                  <button
                                    onClick={() => handleApprove(user.id, approvalRoles[user.id] || user.role)}
                                    className="px-4 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(user.id)}
                                    className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 italic">No actions needed</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Bookings' && (
            <AdminBookings />)}
          {activeTab === 'Notifications' && (
            <div className="max-w-[1200px] mx-auto">
              <NotificationsPage onUnreadCountChange={setNotifUnreadCount} />
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="max-w-[1200px] mx-auto pt-4">
              <NotificationPreferences />
            </div>
          )}

          {activeTab === 'Tickets' && (
            <div className="max-w-[1200px] mx-auto">
              <AdminTicketPanel />
            </div>
          )}

          {comingSoonTabs.includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24">
              <div className="w-20 h-20 bg-[#6a0dad]/10 rounded-2xl flex items-center justify-center mb-6">
                <FiBox className="text-[#6a0dad]" size={36} />
              </div>
              <h2 className="font-syne text-2xl font-bold text-gray-800 mb-3">{activeTab}</h2>
              <p className="text-gray-400 text-sm max-w-sm">
                {activeTab === 'Resources' 
                  ? "The Resources & Facilities module is fully functional! Click below to open it."
                  : "This module is currently under development by the team. Check back soon!"}
              </p>
              {activeTab === 'Resources' ? (
                 <button onClick={() => window.location.href = '/resources'} className="mt-6 px-6 py-3 bg-[#6a0dad] hover:bg-[#580b94] text-white text-sm font-semibold rounded-xl transition-all shadow-md">
                   Launch Resources Module
                 </button>
              ) : (
                 <span className="mt-6 px-4 py-2 bg-[#6a0dad]/10 text-[#6a0dad] text-sm font-semibold rounded-full">Coming Soon</span>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}