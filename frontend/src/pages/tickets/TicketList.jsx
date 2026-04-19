import React, { useState, useEffect, useCallback } from 'react';
import ticketService from '../../services/ticketService';

const STATUS_META = {
  OPEN:        { label: 'Open',        color: '#2563eb', bg: '#eff6ff', icon: '📬' },
  IN_PROGRESS: { label: 'In Progress', color: '#d97706', bg: '#fffbeb', icon: '🔧' },
  ON_HOLD:     { label: 'On Hold',     color: '#7c3aed', bg: '#f5f3ff', icon: '⏸️' },
  RESOLVED:    { label: 'Resolved',    color: '#059669', bg: '#ecfdf5', icon: '✅' },
  CLOSED:      { label: 'Closed',      color: '#6b7280', bg: '#f9fafb', icon: '🔒' },
  REJECTED:    { label: 'Rejected',    color: '#dc2626', bg: '#fef2f2', icon: '❌' },
};

const PRIORITY_META = {
  LOW:      { label: 'Low',      color: '#059669', bg: '#ecfdf5' },
  MEDIUM:   { label: 'Medium',   color: '#d97706', bg: '#fffbeb' },
  HIGH:     { label: 'High',     color: '#ea580c', bg: '#fff7ed' },
  CRITICAL: { label: 'Critical', color: '#dc2626', bg: '#fef2f2' },
};

const Badge = ({ meta, value }) => {
  const m = meta[value] || {};
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
      color: m.color || '#374151', background: m.bg || '#f3f4f6',
    }}>
      {m.icon ? `${m.icon} ` : ''}{m.label || value}
    </span>
  );
};

export default function TicketList({ onViewDetails, onCreateNew }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterStatus, setFilterStatus]     = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchText, setSearchText]         = useState('');

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ticketService.getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  // ---- Filtering ----
  const filtered = tickets.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const inLocation = (t.resourceOrLocation || '').toLowerCase().includes(q);
      const inDesc = (t.description || '').toLowerCase().includes(q);
      const inId = (t.id || '').toLowerCase().includes(q);
      if (!inLocation && !inDesc && !inId) return false;
    }
    return true;
  });

  const selectStyle = {
    padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
    fontSize: '13px', color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none',
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>🎫 My Tickets</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            Track all your submitted maintenance and incident tickets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadTickets}
            style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
          >
            🔄 Refresh
          </button>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', background: '#6a0dad', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 2px 8px rgba(106,13,173,0.25)' }}
            >
              + Report Issue
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
        padding: '16px 20px', marginBottom: '20px',
        display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="🔍 Search by location, description or ID…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ ...selectStyle, flex: '1', minWidth: '200px', padding: '8px 14px' }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="ALL">All Statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={selectStyle}>
          <option value="ALL">All Categories</option>
          {['ELECTRICAL','PLUMBING','IT_EQUIPMENT','HVAC','STRUCTURAL','CLEANING','SECURITY','FURNITURE','OTHER'].map((c) => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectStyle}>
          <option value="ALL">All Priorities</option>
          {Object.entries(PRIORITY_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        {(filterStatus !== 'ALL' || filterCategory !== 'ALL' || filterPriority !== 'ALL' || searchText) && (
          <button
            onClick={() => { setFilterStatus('ALL'); setFilterCategory('ALL'); setFilterPriority('ALL'); setSearchText(''); }}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #fca5a5', color: '#dc2626', background: '#fef2f2', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Count badge */}
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
        Showing <strong>{filtered.length}</strong> of <strong>{tickets.length}</strong> tickets
      </p>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6a0dad', fontWeight: '600' }}>
          ⏳ Loading your tickets…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '18px', color: '#b91c1c', fontWeight: '600' }}>
          ❌ {error}
          <button onClick={loadTickets} style={{ marginLeft: '12px', textDecoration: 'underline', background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <h3 style={{ color: '#374151', fontWeight: '700', marginBottom: '8px' }}>
            {tickets.length === 0 ? 'No tickets yet' : 'No matching tickets'}
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            {tickets.length === 0
              ? 'You haven\'t reported any issues yet. Use "Report Issue" to get started.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      )}

      {/* Ticket Cards */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((ticket) => {
            const sm = STATUS_META[ticket.status] || STATUS_META.OPEN;
            const pm = PRIORITY_META[ticket.priority] || PRIORITY_META.MEDIUM;
            const dateStr = ticket.createdAt
              ? new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—';
            const shortId = ticket.id ? '#' + ticket.id.slice(-8).toUpperCase() : '—';

            return (
              <div
                key={ticket.id}
                style={{
                  background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
                  padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: '20px',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 18px rgba(106,13,173,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}
              >
                {/* Status icon circle */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                  background: sm.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px',
                }}>
                  {sm.icon}
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>
                      {ticket.resourceOrLocation || 'Unknown Location'}
                    </span>
                    <Badge meta={STATUS_META} value={ticket.status} />
                    <Badge meta={PRIORITY_META} value={ticket.priority} />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#6b7280' }}>
                    <span>📁 {(ticket.category || '').replace('_', ' ')}</span>
                    <span>🗓 {dateStr}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af' }}>{shortId}</span>
                    {ticket.assignedTo && (
                      <span>👷 {ticket.assignedTo.fullName || ticket.assignedTo.email || 'Assigned'}</span>
                    )}
                  </div>
                  {ticket.description && (
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '500px' }}>
                      {ticket.description}
                    </p>
                  )}
                </div>

                {/* View button */}
                <button
                  onClick={() => onViewDetails && onViewDetails(ticket.id)}
                  style={{
                    padding: '9px 20px', borderRadius: '9px', border: '1.5px solid #6a0dad',
                    background: '#fff', color: '#6a0dad', fontWeight: '700', cursor: 'pointer',
                    fontSize: '13px', flexShrink: 0, transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#6a0dad'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6a0dad'; }}
                >
                  View Details →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
