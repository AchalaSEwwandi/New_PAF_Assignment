import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiX, FiCheck, FiCheckCircle, FiTrash2, FiInbox } from 'react-icons/fi';

const TYPE_COLORS = {
  BOOKING:     { bg: 'bg-blue-100',   text: 'text-blue-600',   dot: 'bg-blue-500',   label: 'Booking'  },
  TICKET:      { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-500', label: 'Ticket'   },
  NEW_COMMENT: { bg: 'bg-purple-100', text: 'text-purple-600', dot: 'bg-purple-500', label: 'Comment'  },
  SYSTEM:      { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-500',   label: 'System'   },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now  = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationDropdown({ onUnreadCountChange }) {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const dropdownRef = useRef(null);
  const jwt = localStorage.getItem('jwt');

  // ─── Poll unread count every 30 seconds (lightweight) ────────────────────
  const fetchUnreadCount = () => {
    if (!jwt) return;
    fetch('http://localhost:8082/api/notifications/unread-count', {
      headers: { Authorization: 'Bearer ' + jwt },
    })
      .then(res => res.json())
      .then(data => {
        const count = data.count ?? 0;
        setUnreadCount(count);
        if (onUnreadCountChange) onUnreadCountChange(count);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for badge update
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Load full list only when dropdown is opened ─────────────────────────
  const fetchNotifications = () => {
    if (!jwt) return;
    setLoading(true);
    fetch('http://localhost:8082/api/notifications', {
      headers: { Authorization: 'Bearer ' + jwt },
    })
      .then(res => res.json())
      .then(data => {
        const list  = Array.isArray(data) ? data : [];
        const count = list.filter(n => !n.read).length;
        setNotifications(list);
        setUnreadCount(count);
        if (onUnreadCountChange) onUnreadCountChange(count);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Open / close dropdown
  const handleBellClick = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications(); // load full list on open
  };

  // ─── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const updateCount = (list) => {
    const c = list.filter(n => !n.read).length;
    setUnreadCount(c);
    if (onUnreadCountChange) onUnreadCountChange(c);
  };

  const markAsRead = (id) => {
    fetch(`http://localhost:8082/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + jwt },
    }).then(() => {
      setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
        updateCount(updated);
        return updated;
      });
    });
  };

  const markAllAsRead = () => {
    fetch('http://localhost:8082/api/notifications/mark-all-read', {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + jwt },
    }).then(() => {
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, read: true }));
        updateCount(updated);
        return updated;
      });
    });
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    fetch(`http://localhost:8082/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + jwt },
    }).then(() => {
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        updateCount(updated);
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
      setUnreadCount(0);
      if (onUnreadCountChange) onUnreadCountChange(0);
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button — badge driven by /unread-count polling */}
      <button
        onClick={handleBellClick}
        className="relative text-gray-500 hover:text-[#6a0dad] transition-colors"
        title="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel — full list loaded when opened */}
      {open && (
        <div
          className="absolute right-0 top-10 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          style={{ maxHeight: '520px', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FiBell size={16} className="text-[#6a0dad]" />
              <h3 className="font-syne font-bold text-gray-800 text-[15px]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#6a0dad]/10 text-[#6a0dad] text-[11px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-[#6a0dad] font-semibold hover:underline flex items-center gap-1"
                      title="Mark all as read"
                    >
                      <FiCheckCircle size={13} />
                      All read
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="text-[11px] text-red-400 font-semibold hover:underline flex items-center gap-1"
                    title="Clear all"
                  >
                    <FiTrash2 size={13} />
                    Clear
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition ml-1"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {loading && (
              <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <FiInbox size={26} className="text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm font-medium">You're all caught up!</p>
                <p className="text-gray-300 text-xs mt-1">No notifications yet.</p>
              </div>
            )}

            {!loading && notifications.map(notification => {
              const typeStyle = TYPE_COLORS[notification.type] || TYPE_COLORS.SYSTEM;
              return (
                <div
                  key={notification.id}
                  onClick={() => { if (!notification.read) markAsRead(notification.id); }}
                  className={`flex items-start gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer group ${!notification.read ? 'bg-[#6a0dad]/[0.03]' : ''}`}
                >
                  {/* Unread dot */}
                  <div className="shrink-0 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${!notification.read ? typeStyle.dot : 'bg-gray-200'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${typeStyle.bg} ${typeStyle.text}`}>
                        {typeStyle.label}
                      </span>
                      {!notification.read && (
                        <span className="text-[10px] text-[#6a0dad] font-semibold">New</span>
                      )}
                    </div>
                    <p className={`text-sm leading-snug ${!notification.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Action buttons (on hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!notification.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                        className="p-1.5 rounded-lg hover:bg-[#6a0dad]/10 text-[#6a0dad] transition"
                        title="Mark as read"
                      >
                        <FiCheck size={13} />
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteNotification(notification.id, e)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"
                      title="Delete"
                    >
                      <FiX size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 text-center shrink-0">
              <p className="text-[11px] text-gray-400">
                {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
