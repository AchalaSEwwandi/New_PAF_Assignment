import React, { useState, useEffect, useCallback } from 'react';
import { FiBell, FiCheckCircle, FiTrash2, FiX, FiCheck, FiInbox, FiRefreshCw } from 'react-icons/fi';

const TYPE_COLORS = {
  BOOKING: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Booking' },
  TICKET: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Ticket' },
  NEW_COMMENT: { bg: 'bg-[#6a0dad]/10', text: 'text-[#6a0dad]', dot: 'bg-[#6a0dad]', label: 'Comment' },
  SYSTEM: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'System' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage({ onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread
  const jwt = localStorage.getItem('jwt');

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:8082/api/notifications', {
      headers: { Authorization: 'Bearer ' + jwt },
    })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setNotifications(list);
        const unread = list.filter(n => !n.read).length;
        if (onUnreadCountChange) onUnreadCountChange(unread);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jwt, onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = (id) => {
    fetch(`http://localhost:8082/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + jwt },
    }).then(() => {
      setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
        if (onUnreadCountChange) onUnreadCountChange(updated.filter(n => !n.read).length);
        return updated;
      });
    });
  };

  const markAllAsRead = () => {
    fetch('http://localhost:8082/api/notifications/mark-all-read', {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + jwt },
    }).then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
    });
  };

  const deleteNotification = (id) => {
    const removed = notifications.find(n => n.id === id);
    fetch(`http://localhost:8082/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + jwt },
    }).then(() => {
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        if (onUnreadCountChange) onUnreadCountChange(updated.filter(n => !n.read).length);
        return updated;
      });
    });
  };

  const clearAll = () => {
    fetch('http://localhost:8082/api/notifications/clear-all', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + jwt },
    }).then(() => {
      setNotifications([]);
      if (onUnreadCountChange) onUnreadCountChange(0);
    });
  };

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-[860px] mx-auto space-y-5">

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center">
            <FiBell className="text-[#6a0dad]" size={22} />
          </div>
          <div>
            <h2 className="font-syne font-bold text-xl text-gray-800">Notifications</h2>
            <p className="text-sm text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl text-gray-400 hover:text-[#6a0dad] hover:bg-[#6a0dad]/5 transition"
            title="Refresh"
          >
            <FiRefreshCw size={16} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#6a0dad]/10 text-[#6a0dad] text-sm font-semibold rounded-xl hover:bg-[#6a0dad]/20 transition"
            >
              <FiCheckCircle size={15} />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-100 transition"
            >
              <FiTrash2 size={15} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'unread'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition ${
              filter === tab
                ? 'bg-[#6a0dad] text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#6a0dad] hover:text-[#6a0dad]'
            }`}
          >
            {tab === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
          Loading notifications...
        </div>
      )}

      {!loading && displayed.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FiInbox size={28} className="text-gray-300" />
          </div>
          <h3 className="font-syne font-bold text-gray-700 mb-1">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-gray-400 text-sm">
            {filter === 'unread' ? "You're all caught up! ✅" : 'Notifications will appear here when events happen.'}
          </p>
        </div>
      )}

      {!loading && displayed.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {displayed.map((notification, index) => {
            const typeStyle = TYPE_COLORS[notification.type] || TYPE_COLORS.SYSTEM;
            return (
              <div
                key={notification.id}
                onClick={() => { if (!notification.read) markAsRead(notification.id); }}
                className={`flex items-start gap-4 px-6 py-5 cursor-pointer group transition-colors hover:bg-gray-50/70
                  ${index !== 0 ? 'border-t border-gray-100' : ''}
                  ${!notification.read ? 'bg-[#6a0dad]/[0.025]' : ''}
                `}
              >
                {/* Unread indicator dot */}
                <div className="shrink-0 mt-2">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    !notification.read ? typeStyle.dot : 'bg-gray-200'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg uppercase tracking-wide ${typeStyle.bg} ${typeStyle.text}`}>
                      {typeStyle.label}
                    </span>
                    {!notification.read && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-[#6a0dad] bg-[#6a0dad]/10 rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  <p className={`text-sm leading-relaxed ${
                    !notification.read ? 'text-gray-800 font-medium' : 'text-gray-500'
                  }`}>
                    {notification.message}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* Action buttons (visible on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                  {!notification.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6a0dad]/10 text-[#6a0dad] text-[11px] font-semibold hover:bg-[#6a0dad]/20 transition"
                      title="Mark as read"
                    >
                      <FiCheck size={12} />
                      Read
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                    title="Delete notification"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer count */}
      {!loading && notifications.length > 0 && (
        <p className="text-center text-[11px] text-gray-400 pb-2">
          {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
