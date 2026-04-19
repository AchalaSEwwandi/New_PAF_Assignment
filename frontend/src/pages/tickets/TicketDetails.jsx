import React, { useState, useEffect, useCallback } from 'react';
import ticketService from '../../services/ticketService';

const STATUS_META = {
  OPEN:        { label: 'Open',        color: '#2563eb', bg: '#eff6ff', icon: '📬', step: 1 },
  IN_PROGRESS: { label: 'In Progress', color: '#d97706', bg: '#fffbeb', icon: '🔧', step: 2 },
  ON_HOLD:     { label: 'On Hold',     color: '#7c3aed', bg: '#f5f3ff', icon: '⏸️', step: 2 },
  RESOLVED:    { label: 'Resolved',    color: '#059669', bg: '#ecfdf5', icon: '✅', step: 3 },
  CLOSED:      { label: 'Closed',      color: '#6b7280', bg: '#f9fafb', icon: '🔒', step: 4 },
  REJECTED:    { label: 'Rejected',    color: '#dc2626', bg: '#fef2f2', icon: '❌', step: -1 },
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
      padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
      color: m.color || '#374151', background: m.bg || '#f3f4f6',
    }}>
      {m.icon ? `${m.icon} ` : ''}{m.label || value}
    </span>
  );
};

const TIMELINE_STEPS = [
  { key: 'OPEN', label: 'Opened', icon: '📬' },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: '🔧' },
  { key: 'RESOLVED', label: 'Resolved', icon: '✅' },
  { key: 'CLOSED', label: 'Closed', icon: '🔒' },
];

function StatusTimeline({ status }) {
  if (status === 'REJECTED') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 0' }}>
        <span style={{ fontSize: '20px' }}>❌</span>
        <span style={{ fontWeight: '700', color: '#dc2626' }}>Ticket Rejected</span>
      </div>
    );
  }
  const currentStep = STATUS_META[status]?.step || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', padding: '8px 0' }}>
      {TIMELINE_STEPS.map((s, idx) => {
        const sm = STATUS_META[s.key] || {};
        const done = sm.step <= currentStep;
        const active = s.key === status || (status === 'ON_HOLD' && s.key === 'IN_PROGRESS');
        return (
          <React.Fragment key={s.key}>
            {idx > 0 && (
              <div style={{ flex: 1, height: '3px', minWidth: '40px', background: done ? '#6a0dad' : '#e5e7eb', transition: 'background 0.4s' }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? '#6a0dad' : done ? '#d8b4fe' : '#f3f4f6',
                border: active ? '3px solid #6a0dad' : done ? '2px solid #d8b4fe' : '2px solid #e5e7eb',
                boxShadow: active ? '0 0 0 4px rgba(106,13,173,0.15)' : 'none',
                transition: 'all 0.3s',
              }}>
                {s.icon}
              </div>
              <span style={{ fontSize: '11px', fontWeight: active ? '700' : '500', color: active ? '#6a0dad' : done ? '#7c3aed' : '#9ca3af', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function TicketDetails({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [ticketError, setTicketError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoadingTicket(true);
    setTicketError('');
    try {
      const data = await ticketService.getTicketById(ticketId);
      setTicket(data);
    } catch (err) {
      setTicketError(err.message || 'Failed to load ticket.');
    } finally {
      setLoadingTicket(false);
    }
  }, [ticketId]);

  const loadComments = useCallback(async () => {
    if (!ticketId) return;
    setLoadingComments(true);
    setCommentError('');
    try {
      const data = await ticketService.getComments(ticketId);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setCommentError(err.message || 'Failed to load comments.');
    } finally {
      setLoadingComments(false);
    }
  }, [ticketId]);

  useEffect(() => { loadTicket(); loadComments(); }, [loadTicket, loadComments]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    setPostError('');
    try {
      const posted = await ticketService.addComment(ticketId, newComment.trim());
      setComments((prev) => [...prev, posted]);
      setNewComment('');
    } catch (err) {
      setPostError(err.message || 'Failed to post comment.');
    } finally {
      setPosting(false);
    }
  };

  const sectionCard = (children, extra = {}) => ({
    background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)', padding: '24px', marginBottom: '20px', ...extra,
  });

  const sectionTitle = (title) => (
    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#6a0dad', margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {title}
    </h3>
  );

  if (loadingTicket) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#6a0dad', fontWeight: '600', fontFamily: 'DM Sans, sans-serif' }}>
        ⏳ Loading ticket details…
      </div>
    );
  }

  if (ticketError) {
    return (
      <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6a0dad', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>← Back to My Tickets</button>}
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '20px', color: '#b91c1c', fontWeight: '600' }}>
          ❌ {ticketError}
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const sm = STATUS_META[ticket.status] || STATUS_META.OPEN;
  const pm = PRIORITY_META[ticket.priority] || PRIORITY_META.MEDIUM;
  const createdDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-GB') : '—';
  const updatedDate = ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('en-GB') : '—';
  const shortId = ticket.id ? '#' + ticket.id.slice(-8).toUpperCase() : '—';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#6a0dad', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
        >
          ← Back to My Tickets
        </button>
      )}

      {/* Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {ticket.title || ticket.resourceOrLocation || 'Ticket Details'}
          </h2>
          <Badge meta={STATUS_META} value={ticket.status} />
          <Badge meta={PRIORITY_META} value={ticket.priority} />
        </div>
        <p style={{ color: '#9ca3af', fontSize: '13px', fontFamily: 'monospace', marginTop: '6px' }}>{shortId}</p>
      </div>

      {/* Status Timeline */}
      <div style={sectionCard({})}>
        {sectionTitle('📍 Ticket Status')}
        <StatusTimeline status={ticket.status} />

        {/* Rejection notice */}
        {ticket.status === 'REJECTED' && ticket.rejectionReason && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '14px 18px', marginTop: '16px' }}>
            <p style={{ fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>❌ Rejection Reason</p>
            <p style={{ color: '#7f1d1d', fontSize: '14px', margin: 0 }}>{ticket.rejectionReason}</p>
          </div>
        )}

        {/* Resolution notes */}
        {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && ticket.resolutionNotes && (
          <div style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', borderRadius: '10px', padding: '14px 18px', marginTop: '16px' }}>
            <p style={{ fontWeight: '700', color: '#065f46', marginBottom: '4px' }}>✅ Resolution Notes</p>
            <p style={{ color: '#064e3b', fontSize: '14px', margin: 0 }}>{ticket.resolutionNotes}</p>
          </div>
        )}
      </div>

      {/* Issue Details */}
      <div style={sectionCard({})}>
        {sectionTitle('📋 Issue Details')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {[
            { label: 'Location / Resource', value: ticket.resourceOrLocation || '—' },
            { label: 'Category', value: (ticket.category || '—').replace('_', ' ') },
            { label: 'Created', value: createdDate },
            { label: 'Last Updated', value: updatedDate },
            { label: 'Assigned Technician', value: ticket.assignedTo ? (ticket.assignedTo.fullName || ticket.assignedTo.email) : 'Not yet assigned' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{label}</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Description</p>
          <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{ticket.description || '—'}</p>
        </div>
      </div>

      {/* Contact Details */}
      {(ticket.preferredContactName || ticket.preferredContactEmail || ticket.preferredContactPhone) && (
        <div style={sectionCard({})}>
          {sectionTitle('📞 Preferred Contact')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {ticket.preferredContactName && (
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Name</p>
                <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: '500' }}>{ticket.preferredContactName}</p>
              </div>
            )}
            {ticket.preferredContactEmail && (
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Email</p>
                <a href={`mailto:${ticket.preferredContactEmail}`} style={{ fontSize: '14px', color: '#6a0dad', fontWeight: '500' }}>{ticket.preferredContactEmail}</a>
              </div>
            )}
            {ticket.preferredContactPhone && (
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Phone</p>
                <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: '500' }}>{ticket.preferredContactPhone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Attachments */}
      {ticket.imageAttachments && ticket.imageAttachments.length > 0 && (
        <div style={sectionCard({})}>
          {sectionTitle('📷 Photo Evidence')}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {ticket.imageAttachments.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`attachment-${i + 1}`}
                onClick={() => setSelectedImage(src)}
                style={{
                  width: '130px', height: '130px', objectFit: 'cover', borderRadius: '12px',
                  border: '2px solid #e5e7eb', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(106,13,173,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'zoom-out',
          }}
        >
          <img src={selectedImage} alt="full" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }} />
        </div>
      )}

      {/* Comments Section */}
      <div style={sectionCard({})}>
        {sectionTitle(`💬 Comments (${comments.length})`)}

        {/* Comment error */}
        {commentError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', color: '#b91c1c', fontSize: '13px', marginBottom: '14px' }}>
            {commentError}
          </div>
        )}

        {/* Existing comments */}
        {loadingComments ? (
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading comments…</p>
        ) : comments.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No comments yet. Be the first to add one.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {comments.map((c) => {
              const author = c.author ? (c.author.fullName || c.author.email || 'User') : 'User';
              const initials = author.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
              const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleString('en-GB') : '';
              return (
                <div key={c.id} style={{
                  display: 'flex', gap: '12px', padding: '14px 16px',
                  background: '#faf5ff', borderRadius: '12px', border: '1px solid #ede9fe',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: '#6a0dad', color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: '700', fontSize: '13px',
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>{author}</span>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>{dateStr}</span>
                    </div>
                    <p style={{ margin: 0, color: '#374151', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{c.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add comment */}
        {ticket.status !== 'CLOSED' && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Add a Comment</p>
            <textarea
              rows={3}
              placeholder="Type your comment here…"
              value={newComment}
              onChange={(e) => { setNewComment(e.target.value); setPostError(''); }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: postError ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                fontSize: '14px', color: '#111827', resize: 'vertical', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
            {postError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{postError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={handlePostComment}
                disabled={posting || !newComment.trim()}
                style={{
                  padding: '9px 24px', borderRadius: '9px', border: 'none',
                  background: posting || !newComment.trim() ? '#a78bfa' : '#6a0dad',
                  color: '#fff', fontWeight: '700', cursor: posting || !newComment.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '13px', transition: 'background 0.2s',
                }}
              >
                {posting ? '⏳ Posting…' : '💬 Post Comment'}
              </button>
            </div>
          </div>
        )}

        {ticket.status === 'CLOSED' && (
          <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>This ticket is closed. Comments are disabled.</p>
        )}
      </div>
    </div>
  );
}
