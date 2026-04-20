import React, { useState, useEffect, useCallback } from 'react';
import {
  FiSearch, FiBell, FiLogOut, FiHome, FiTag,
  FiMap, FiCheckSquare, FiBarChart2, FiFileText,
} from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import ticketService from './services/ticketService';

// ─── Shared badge/meta maps ───────────────────────────────────────
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
// Statuses a technician is allowed to set
const TECH_ALLOWED_STATUSES = ['IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'];

const Badge = ({ meta, value }) => {
  const m = meta[value] || {};
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
      color: m.color || '#374151', background: m.bg || '#f3f4f6',
    }}>
      {m.icon ? `${m.icon} ` : ''}{m.label || value}
    </span>
  );
};

// ─── Status Update Modal ──────────────────────────────────────────
function StatusModal({ open, ticket, onClose, onDone }) {
  const [status, setStatus]      = useState('');
  const [notes,  setNotes]       = useState('');
  const [saving, setSaving]      = useState(false);
  const [err,    setErr]         = useState('');

  useEffect(() => {
    if (open) { setStatus(ticket?.status || ''); setNotes(ticket?.resolutionNotes || ''); setErr(''); }
  }, [open, ticket]);

  const handleSave = async () => {
    if (!status) { setErr('Status is required.'); return; }
    if (status === 'RESOLVED' && !notes.trim()) { setErr('Resolution notes are required before marking as RESOLVED.'); return; }
    setSaving(true); setErr('');
    try {
      await ticketService.techUpdateStatus(ticket.id, status, notes || undefined);
      onDone();
    } catch (e) { setErr(e.message || 'Failed to update.'); }
    finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 }}>🔄 Update Ticket Status</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
          Ticket: <strong>{ticket?.resourceOrLocation}</strong>
        </p>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>New Status *</label>
        <select value={status} onChange={e => { setStatus(e.target.value); setErr(''); }}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', background: '#fff', marginBottom: '16px' }}>
          <option value="">— select status —</option>
          {TECH_ALLOWED_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_META[s]?.icon} {STATUS_META[s]?.label || s}</option>
          ))}
        </select>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
          Resolution Notes {status === 'RESOLVED' && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <textarea rows={4} placeholder={status === 'RESOLVED' ? 'Required: describe how the issue was resolved…' : 'Optional notes…'}
          value={notes} onChange={e => { setNotes(e.target.value); setErr(''); }}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111827', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        {err && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{err}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '9px 26px', borderRadius: '9px', border: 'none', background: saving ? '#a78bfa' : '#6a0dad', color: '#fff', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
            {saving ? 'Saving…' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ticket Detail View ───────────────────────────────────────────
function TechTicketDetail({ ticketId, onBack }) {
  const [ticket,   setTicket]   = useState(null);
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting,  setPosting]  = useState(false);
  const [postErr,  setPostErr]  = useState('');
  const [statusModal, setStatusModal] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const [t, c] = await Promise.all([
        ticketService.techGetTicketById(ticketId),
        ticketService.techGetComments(ticketId),
      ]);
      setTicket(t);
      setComments(Array.isArray(c) ? c : []);
    } catch (e) { setErr(e.message || 'Failed to load.'); }
    finally { setLoading(false); }
  }, [ticketId]);

  useEffect(() => { load(); }, [load]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true); setPostErr('');
    try {
      const posted = await ticketService.techAddComment(ticketId, newComment.trim());
      setComments(p => [...p, posted]);
      setNewComment('');
    } catch (e) { setPostErr(e.message || 'Failed to post.'); }
    finally { setPosting(false); }
  };

  const afterStatusUpdate = () => { setStatusModal(false); load(); };

  const card = {
    background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
    boxShadow: '0 1px 5px rgba(0,0,0,0.05)', padding: '24px', marginBottom: '18px',
  };
  const sTitle = t => <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#6a0dad', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t}</h3>;

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#6a0dad', fontWeight: '600', fontFamily: 'DM Sans,sans-serif' }}>⏳ Loading ticket…</div>;
  if (err)     return (
    <div style={{ fontFamily: 'DM Sans,sans-serif' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6a0dad', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '16px', padding: 0 }}>← Back</button>
      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '18px', color: '#b91c1c' }}>{err}</div>
    </div>
  );
  if (!ticket) return null;

  const canUpdate = ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', fontFamily: 'DM Sans,sans-serif' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6a0dad', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '18px', padding: 0 }}>
        ← Back to My Tickets
      </button>

      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>{ticket.title || ticket.resourceOrLocation}</h2>
          <Badge meta={STATUS_META} value={ticket.status} />
          <Badge meta={PRIORITY_META} value={ticket.priority} />
        </div>
        <p style={{ color: '#9ca3af', fontSize: '12px', fontFamily: 'monospace', marginTop: '6px' }}>#{ticket.id?.slice(-8).toUpperCase()}</p>
      </div>

      {/* Action button */}
      {canUpdate && (
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setStatusModal(true)}
            style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: '#6a0dad', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
            🔄 Update Status
          </button>
        </div>
      )}

      {/* Rejection / Resolution banners */}
      {ticket.status === 'REJECTED' && ticket.rejectionReason && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '14px 18px', marginBottom: '18px' }}>
          <p style={{ fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>❌ Rejection Reason (set by Admin)</p>
          <p style={{ color: '#7f1d1d', fontSize: '14px', margin: 0 }}>{ticket.rejectionReason}</p>
        </div>
      )}
      {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && ticket.resolutionNotes && (
        <div style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', borderRadius: '12px', padding: '14px 18px', marginBottom: '18px' }}>
          <p style={{ fontWeight: '700', color: '#065f46', marginBottom: '4px' }}>✅ Resolution Notes</p>
          <p style={{ color: '#064e3b', fontSize: '14px', margin: 0 }}>{ticket.resolutionNotes}</p>
        </div>
      )}

      {/* Details grid */}
      <div style={card}>
        {sTitle('📋 Ticket Details')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px', marginBottom: '16px' }}>
          {[
            ['Location',    ticket.resourceOrLocation || '—'],
            ['Category',    (ticket.category || '—').replace('_', ' ')],
            ['Reported By', ticket.createdBy ? (ticket.createdBy.fullName || ticket.createdBy.email) : '—'],
            ['Created',     ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-GB') : '—'],
            ['Updated',     ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('en-GB') : '—'],
          ].map(([label, val]) => (
            <div key={label}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{label}</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Description</p>
          <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{ticket.description || '—'}</p>
        </div>
      </div>

      {/* Contact */}
      {(ticket.preferredContactName || ticket.preferredContactEmail || ticket.preferredContactPhone) && (
        <div style={card}>
          {sTitle('📞 Student Contact')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '14px' }}>
            {ticket.preferredContactName && <div><p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Name</p><p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: '500' }}>{ticket.preferredContactName}</p></div>}
            {ticket.preferredContactEmail && <div><p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Email</p><a href={`mailto:${ticket.preferredContactEmail}`} style={{ fontSize: '14px', color: '#6a0dad', fontWeight: '500' }}>{ticket.preferredContactEmail}</a></div>}
            {ticket.preferredContactPhone && <div><p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Phone</p><p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: '500' }}>{ticket.preferredContactPhone}</p></div>}
          </div>
        </div>
      )}

      {/* Images */}
      {ticket.imageAttachments?.length > 0 && (
        <div style={card}>
          {sTitle('📷 Photo Evidence')}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {ticket.imageAttachments.map((src, i) => (
              <img key={i} src={src} alt={`att-${i + 1}`} onClick={() => setLightbox(src)}
                style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e5e7eb', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      )}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }}>
          <img src={lightbox} alt="full" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px' }} />
        </div>
      )}

      {/* Comments */}
      <div style={card}>
        {sTitle(`💬 Comments (${comments.length})`)}
        {comments.length === 0
          ? <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>No comments yet.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              {comments.map(c => {
                const author = c.author ? (c.author.fullName || c.author.email || 'User') : 'User';
                const initials = author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={c.id} style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: '#faf5ff', borderRadius: '12px', border: '1px solid #ede9fe' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: '#6a0dad', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', color: '#111827', fontSize: '13px' }}>{author}</span>
                        <span style={{ color: '#9ca3af', fontSize: '11px' }}>{c.createdAt ? new Date(c.createdAt).toLocaleString('en-GB') : ''}</span>
                      </div>
                      <p style={{ margin: 0, color: '#374151', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{c.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
        }
        {/* Add comment */}
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Add Comment</p>
        <textarea rows={3} placeholder="Type a comment or update…" value={newComment} onChange={e => { setNewComment(e.target.value); setPostErr(''); }}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111827', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        {postErr && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{postErr}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button onClick={handlePostComment} disabled={posting || !newComment.trim()}
            style={{ padding: '9px 24px', borderRadius: '9px', border: 'none', background: posting || !newComment.trim() ? '#a78bfa' : '#6a0dad', color: '#fff', fontWeight: '700', cursor: posting || !newComment.trim() ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
            {posting ? '⏳ Posting…' : '💬 Post Comment'}
          </button>
        </div>
      </div>

      <StatusModal open={statusModal} ticket={ticket} onClose={() => setStatusModal(false)} onDone={afterStatusUpdate} />
    </div>
  );
}

// ─── My Tickets list (active assigned) ───────────────────────────
function MyTicketsPanel({ onViewDetail }) {
  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [err,       setErr]       = useState('');
  const [search,    setSearch]    = useState('');
  const [fStatus,   setFStatus]   = useState('ALL');
  const [fPriority, setFPriority] = useState('ALL');
  const [statusModal, setStatusModal] = useState(null); // ticket obj

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const data = await ticketService.techGetMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message || 'Failed to load.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tickets.filter(t => {
    if (fStatus !== 'ALL' && t.status !== fStatus) return false;
    if (fPriority !== 'ALL' && t.priority !== fPriority) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return [t.resourceOrLocation, t.description, t.id, t.category].some(v => (v || '').toLowerCase().includes(q));
    }
    return true;
  });

  // ---- Priority sort: HIGH/CRITICAL first ----
  const PRIORITY_ORDER = { HIGH: 0, CRITICAL: 1, MEDIUM: 2, LOW: 3 };
  const sortedFiltered = [...filtered].sort((a, b) =>
    (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)
  );

  // ---- Urgent count for alert banner ----
  const urgentCount = tickets.filter(t =>
    (t.priority === 'HIGH' || t.priority === 'CRITICAL') &&
    t.status !== 'CLOSED' && t.status !== 'RESOLVED'
  ).length;

  const sel = { padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '13px', color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none' };
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'DM Sans,sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>🔧 My Assigned Tickets</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Tickets assigned to you for resolution.</p>
        </div>
        <button onClick={load} style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>🔄 Refresh</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'Total Assigned', value: tickets.length, color: '#6a0dad', bg: '#f5f3ff' },
          { label: 'Open',           value: openCount,       color: '#2563eb', bg: '#eff6ff' },
          { label: 'In Progress',    value: inProgressCount, color: '#d97706', bg: '#fffbeb' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '18px 20px', border: `1.5px solid ${s.color}30` }}>
            <p style={{ fontSize: '24px', fontWeight: '800', color: s.color, margin: '0 0 4px' }}>{s.value}</p>
            <p style={{ fontSize: '12px', fontWeight: '600', color: s.color, margin: 0, opacity: 0.8 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: '18px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by location, category or ID…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...sel, flex: '1', minWidth: '200px', padding: '8px 14px' }} />
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={sel}>
          <option value="ALL">All Statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select value={fPriority} onChange={e => setFPriority(e.target.value)} style={sel}>
          <option value="ALL">All Priorities</option>
          {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {(fStatus !== 'ALL' || fPriority !== 'ALL' || search) && (
          <button onClick={() => { setFStatus('ALL'); setFPriority('ALL'); setSearch(''); }}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #fca5a5', color: '#dc2626', background: '#fef2f2', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ⚠ Urgent Alert Banner */}
      {!loading && !err && urgentCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#fef2f2', border: '1.5px solid #fca5a5',
          borderRadius: '12px', padding: '12px 18px', marginBottom: '16px',
          color: '#b91c1c', fontWeight: '700', fontSize: '14px',
        }}>
          <span style={{ fontSize: '18px' }}>⚠</span>
          You have <span style={{ fontWeight: '800', margin: '0 4px' }}>{urgentCount}</span> urgent ticket{urgentCount > 1 ? 's' : ''} assigned requiring attention
        </div>
      )}

      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
        Showing <strong>{sortedFiltered.length}</strong> of <strong>{tickets.length}</strong> tickets
      </p>

      {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6a0dad', fontWeight: '600' }}>⏳ Loading…</div>}
      {!loading && err && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '18px', color: '#b91c1c', fontWeight: '600' }}>❌ {err}</div>}

      {!loading && !err && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔧</div>
          <h3 style={{ color: '#374151', fontWeight: '700', marginBottom: '8px' }}>
            {tickets.length === 0 ? 'No tickets assigned yet' : 'No matching tickets'}
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            {tickets.length === 0 ? 'Tickets assigned to you by admin will appear here.' : 'Try clearing filters.'}
          </p>
        </div>
      )}

      {!loading && !err && sortedFiltered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedFiltered.map(t => {
            const sm = STATUS_META[t.status] || STATUS_META.OPEN;
            const isHighPriority = t.priority === 'HIGH' || t.priority === 'CRITICAL';
            const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
            return (
              <div key={t.id} style={{
                background: isHighPriority ? '#fff8f8' : '#fff',
                borderRadius: '14px',
                border: isHighPriority ? '1.5px solid #fca5a5' : '1px solid #e5e7eb',
                padding: '20px 24px',
                boxShadow: isHighPriority ? '0 2px 8px rgba(220,38,38,0.08)' : '0 1px 4px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: '18px',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = isHighPriority ? '0 4px 18px rgba(220,38,38,0.15)' : '0 4px 18px rgba(106,13,173,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = isHighPriority ? '0 2px 8px rgba(220,38,38,0.08)' : '0 1px 4px rgba(0,0,0,0.05)'}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0, background: sm.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {sm.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>{t.resourceOrLocation || '—'}</span>
                    <Badge meta={STATUS_META} value={t.status} />
                    <Badge meta={PRIORITY_META} value={t.priority} />
                    {isHighPriority && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                        color: '#b91c1c', background: '#fee2e2', border: '1px solid #fca5a5',
                      }}>
                        ⚠ {t.priority === 'CRITICAL' ? 'Critical' : 'High Priority'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: '#6b7280' }}>
                    <span>📁 {(t.category || '').replace('_', ' ')}</span>
                    <span>🗓 {dateStr}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af' }}>#{(t.id || '').slice(-6).toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {t.status !== 'CLOSED' && t.status !== 'REJECTED' && (
                    <button onClick={() => setStatusModal(t)}
                      style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#6a0dad', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
                      🔄 Update
                    </button>
                  )}
                  <button onClick={() => onViewDetail(t.id)}
                    style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #6a0dad', background: '#fff', color: '#6a0dad', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
                    View →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <StatusModal open={!!statusModal} ticket={statusModal} onClose={() => setStatusModal(null)} onDone={() => { setStatusModal(null); load(); }} />
    </div>
  );
}

// ─── Completed / History shared list ─────────────────────────────
function CompletedHistoryPanel({ mode, onViewDetail }) {
  const isCompleted = mode === 'completed';
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState('');
  const [search,  setSearch]  = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const data = isCompleted
        ? await ticketService.techGetCompleted()
        : await ticketService.techGetHistory();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message || 'Failed to load.'); }
    finally { setLoading(false); }
  }, [isCompleted]);

  useEffect(() => { load(); }, [load]);

  const filtered = tickets.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [t.resourceOrLocation, t.description, t.id, t.category, t.resolutionNotes].some(v => (v || '').toLowerCase().includes(q));
  });

  const title = isCompleted ? '✅ Completed Work' : '📋 Ticket History';
  const emptyMsg = isCompleted ? 'No completed tickets yet. Resolved/Closed tickets will appear here.' : 'No handled tickets found.';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'DM Sans,sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>{title}</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            {isCompleted ? 'Tickets you have resolved or closed.' : 'All tickets you have handled across all statuses.'}
          </p>
        </div>
        <button onClick={load} style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>🔄 Refresh</button>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '14px 18px', marginBottom: '18px' }}>
        <input type="text" placeholder="🔍 Search by location, category, resolution notes…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '13px', color: '#374151', background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
        Showing <strong>{filtered.length}</strong> of <strong>{tickets.length}</strong> tickets
      </p>

      {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6a0dad', fontWeight: '600' }}>⏳ Loading…</div>}
      {!loading && err && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '18px', color: '#b91c1c', fontWeight: '600' }}>❌ {err}</div>}

      {!loading && !err && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{isCompleted ? '✅' : '📋'}</div>
          <h3 style={{ color: '#374151', fontWeight: '700', marginBottom: '8px' }}>{tickets.length === 0 ? emptyMsg : 'No matching tickets'}</h3>
        </div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#6a0dad', color: '#fff' }}>
                {['ID', 'Location / Category', 'Priority', 'Status', 'Updated', ...(isCompleted ? ['Resolution Notes'] : []), 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                >
                  <td style={{ padding: '12px 14px', fontSize: '11px', fontFamily: 'monospace', color: '#6b7280' }}>#{(t.id || '').slice(-6).toUpperCase()}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 2px' }}>{t.resourceOrLocation || '—'}</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{(t.category || '').replace('_', ' ')}</p>
                  </td>
                  <td style={{ padding: '12px 14px' }}><Badge meta={PRIORITY_META} value={t.priority} /></td>
                  <td style={{ padding: '12px 14px' }}><Badge meta={STATUS_META} value={t.status} /></td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  {isCompleted && (
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#374151', maxWidth: '260px' }}>
                      {t.resolutionNotes
                        ? <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.resolutionNotes}</span>
                        : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>—</span>}
                    </td>
                  )}
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => onViewDetail(t.id)}
                      style={{ padding: '5px 14px', borderRadius: '8px', border: '1.5px solid #6a0dad', background: '#fff', color: '#6a0dad', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function TechnicianDashboard({ setCurrentPage }) {
  const [activeTab, setActiveTab]       = useState('Dashboard');
  const [viewTicketId, setViewTicketId] = useState(null);

  const jwt  = localStorage.getItem('jwt');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!jwt) { setCurrentPage('signin'); }
  }, [jwt, setCurrentPage]);

  const fullName  = user.fullName || user.username || 'Technician';
  const firstName = fullName.split(' ')[0];
  const initial   = firstName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const navigateTo = (tab) => { setActiveTab(tab); setViewTicketId(null); };
  const openDetail = (id)  => { setViewTicketId(id); setActiveTab('Ticket Detail'); };
  const backToList = ()    => { setViewTicketId(null); setActiveTab('My Tickets'); };

  const mainNavItems = [
    { name: 'Dashboard', icon: <FiHome size={18} /> },
    { name: 'My Tickets', icon: <FiTag size={18} /> },
    { name: 'Campus Map', icon: <FiMap size={18} /> },
    { name: 'Completed', icon: <FiCheckSquare size={18} /> },
    { name: 'Notifications', icon: <FiBell size={18} /> },
  ];
  const reportNavItems = [
    { name: 'Work Report', icon: <FiBarChart2 size={18} /> },
    { name: 'History', icon: <FiFileText size={18} /> },
  ];
  const comingSoonTabs = ['Campus Map', 'Notifications', 'Work Report'];

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-dm-sans">
      {/* Sidebar — unchanged design */}
      <div className="w-[280px] bg-[#3a0760] text-white flex flex-col pt-6 pb-6 shadow-xl z-10 shrink-0 border-r border-[#6a0dad]/30">

        {/* Profile Card */}
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

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="mb-6">
            <h3 className="px-4 text-[11px] font-bold text-[#d8b4fe] uppercase tracking-wider mb-3">Main</h3>
            <ul className="space-y-1">
              {mainNavItems.map(item => (
                <li key={item.name}>
                  <button
                    onClick={() => navigateTo(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.name || (item.name === 'My Tickets' && activeTab === 'Ticket Detail')
                        ? 'bg-[#6a0dad] text-white font-semibold shadow-sm'
                        : 'text-[#d8b4fe]/70 hover:text-white hover:bg-[#6a0dad]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={activeTab === item.name ? 'text-white' : ''}>{item.icon}</span>
                      <span className="text-[14px]">{item.name}</span>
                    </div>
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
                    onClick={() => navigateTo(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.name
                        ? 'bg-[#6a0dad] text-white font-semibold outline outline-1 outline-[#6a0dad]/20 shadow-sm'
                        : 'text-[#d8b4fe]/70 hover:text-white hover:bg-[#6a0dad]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={activeTab === item.name ? 'text-white' : ''}>{item.icon}</span>
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
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ef4444] hover:bg-[#ef4444]/10 transition-all font-medium">
            <FiLogOut size={18} />
            <span className="text-[14px]">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-[76px] bg-[#f9fafb] border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-syne text-[20px] font-bold text-gray-800">
            {activeTab === 'Ticket Detail' ? '← Ticket Details' : activeTab}
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#6a0dad]/20 focus:border-[#6a0dad] w-[240px] transition-all" />
            </div>
            <button className="relative text-gray-500 hover:text-gray-700 transition">
              <FiBell size={20} />
            </button>
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-50 transition">
              <div className="w-6 h-6 rounded-full bg-[#6a0dad] flex items-center justify-center text-white font-bold text-[10px]">{initial}</div>
              <span className="text-sm font-medium pr-1 text-gray-700">{firstName}</span>
            </div>
          </div>
        </header>

        {/* Scrolling content */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* ── Dashboard ── */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-8 max-w-[1200px] mx-auto">
              <div className="rounded-2xl bg-gradient-to-r from-[#18181b] via-[#27272a] to-[#6a0dad]/80 p-8 text-white relative overflow-hidden shadow-lg border border-gray-800">
                <div className="relative z-10">
                  <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Welcome back,</p>
                  <h2 className="font-syne text-3xl font-bold mb-2 flex items-center gap-2">{fullName} <span role="img" aria-label="wave">👋</span></h2>
                  <p className="text-gray-300">Ready to tackle today's maintenance tickets?</p>
                </div>
                <div className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <FiCheckSquare className="text-[#a78bfa]" size={24} />
                </div>
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute right-40 top-0 w-48 h-48 bg-[#6a0dad]/40 rounded-full blur-3xl -translate-y-1/2"></div>
              </div>

              <div className="pb-8">
                <h3 className="font-syne text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Links</h3>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { name: 'My Tickets',     icon: <FiTag size={24} />,        desc: 'View and update your assigned facility issues and work orders.' },
                    { name: 'Completed',       icon: <FiCheckSquare size={24} />, desc: 'Review your past completed maintenance work and reports.' },
                    { name: 'History',         icon: <FiFileText size={24} />,    desc: 'Full history of all tickets you have handled.' },
                  ].map(item => (
                    <div key={item.name} onClick={() => navigateTo(item.name)}
                      className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 hover:border-[#6a0dad] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center cursor-pointer">
                      <div className="w-12 h-12 bg-[#6a0dad]/10 rounded-xl flex items-center justify-center mb-4 text-[#6a0dad]">
                        {item.icon}
                      </div>
                      <h4 className="font-syne font-bold text-gray-800 mb-2">{item.name}</h4>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── My Tickets ── */}
          {activeTab === 'My Tickets' && (
            <div className="max-w-[1200px] mx-auto">
              <MyTicketsPanel onViewDetail={openDetail} />
            </div>
          )}

          {/* ── Ticket Detail ── */}
          {activeTab === 'Ticket Detail' && viewTicketId && (
            <div className="max-w-[1200px] mx-auto">
              <TechTicketDetail ticketId={viewTicketId} onBack={backToList} />
            </div>
          )}

          {/* ── Completed ── */}
          {activeTab === 'Completed' && (
            <div className="max-w-[1200px] mx-auto">
              <CompletedHistoryPanel mode="completed" onViewDetail={openDetail} />
            </div>
          )}

          {/* ── History ── */}
          {activeTab === 'History' && (
            <div className="max-w-[1200px] mx-auto">
              <CompletedHistoryPanel mode="history" onViewDetail={openDetail} />
            </div>
          )}

          {/* ── Coming Soon ── */}
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
