import React, { useState, useEffect, useCallback } from 'react';
import ticketService from '../../services/ticketService';

// ─── constant maps ────────────────────────────────────────────────
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
const ALL_STATUSES  = Object.keys(STATUS_META);
const ALL_CATS      = ['ELECTRICAL','PLUMBING','IT_EQUIPMENT','HVAC','STRUCTURAL','CLEANING','SECURITY','FURNITURE','OTHER'];
const ALL_PRIORITIES= Object.keys(PRIORITY_META);
const VALID_STATUSES_FOR_UPDATE = ['OPEN','IN_PROGRESS','ON_HOLD','RESOLVED','CLOSED'];

const Badge = ({ meta, value }) => {
  const m = meta[value] || {};
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',gap:'3px',
      padding:'3px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:'700',
      color: m.color||'#374151', background: m.bg||'#f3f4f6',
    }}>
      {m.icon ? `${m.icon} `:''}{m.label||value}
    </span>
  );
};

// ─── Modal shell ──────────────────────────────────────────────────
const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.5)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',
    }}
      onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}
    >
      <div style={{
        background:'#fff',borderRadius:'20px',padding:'32px',
        width:'100%',maxWidth:'520px',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h3 style={{fontSize:'17px',fontWeight:'700',color:'#111827',margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#9ca3af',lineHeight:1}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Assign Technician Modal ──────────────────────────────────────
function AssignModal({ open, ticket, technicians, onClose, onDone }) {
  const [selected, setSelected] = useState('');
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  useEffect(() => {
    if (open) { setSelected(ticket?.assignedTo?.email || ''); setErr(''); }
  }, [open, ticket]);

  const handleSave = async () => {
    if (!selected) { setErr('Please select a technician.'); return; }
    setSaving(true); setErr('');
    try {
      await ticketService.adminAssignTechnician(ticket.id, selected);
      onDone();
    } catch(e) { setErr(e.message||'Failed to assign.'); }
    finally { setSaving(false); }
  };

  const selectStyle = {
    width:'100%', padding:'10px 14px', borderRadius:'10px',
    border:'1.5px solid #e5e7eb', fontSize:'14px', color:'#111827', outline:'none',
    boxSizing:'border-box', background:'#fff',
  };

  return (
    <Modal open={open} title="👷 Assign Technician" onClose={onClose}>
      <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'16px'}}>
        Ticket: <strong>{ticket?.resourceOrLocation}</strong>
      </p>
      <label style={{fontSize:'13px',fontWeight:'600',color:'#374151',display:'block',marginBottom:'8px'}}>
        Select Technician
      </label>
      {technicians.length === 0
        ? <p style={{color:'#ef4444',fontSize:'13px'}}>No active technicians found. Please ensure technicians are approved in Manage Users.</p>
        : (
          <select value={selected} onChange={e=>setSelected(e.target.value)} style={selectStyle}>
            <option value="">— choose technician —</option>
            {technicians.map(t=>(
              <option key={t.id} value={t.email}>{t.fullName||t.email} ({t.email})</option>
            ))}
          </select>
        )
      }
      {err && <p style={{color:'#ef4444',fontSize:'12px',marginTop:'8px'}}>{err}</p>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
        <button onClick={onClose} style={{padding:'9px 22px',borderRadius:'9px',border:'1.5px solid #e5e7eb',background:'#fff',color:'#374151',fontWeight:'600',cursor:'pointer',fontSize:'13px'}}>Cancel</button>
        <button onClick={handleSave} disabled={saving||technicians.length===0}
          style={{padding:'9px 26px',borderRadius:'9px',border:'none',background:saving?'#a78bfa':'#6a0dad',color:'#fff',fontWeight:'700',cursor:saving?'not-allowed':'pointer',fontSize:'13px'}}>
          {saving?'Saving…':'Assign'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Status Update Modal ──────────────────────────────────────────
function StatusModal({ open, ticket, onClose, onDone }) {
  const [status, setStatus]          = useState('');
  const [resolutionNotes, setNotes]  = useState('');
  const [saving, setSaving]          = useState(false);
  const [err, setErr]                = useState('');

  useEffect(() => {
    if (open) { setStatus(ticket?.status||''); setNotes(''); setErr(''); }
  }, [open, ticket]);

  const handleSave = async () => {
    if (!status) { setErr('Status is required.'); return; }
    setSaving(true); setErr('');
    try {
      await ticketService.adminUpdateStatus(ticket.id, status, resolutionNotes||undefined, undefined);
      onDone();
    } catch(e) { setErr(e.message||'Failed to update.'); }
    finally { setSaving(false); }
  };

  const selectStyle = { width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1.5px solid #e5e7eb',fontSize:'14px',color:'#111827',outline:'none',boxSizing:'border-box',background:'#fff',marginBottom:'14px' };
  const taStyle     = { width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1.5px solid #e5e7eb',fontSize:'14px',color:'#111827',outline:'none',boxSizing:'border-box',resize:'vertical',fontFamily:'inherit' };

  return (
    <Modal open={open} title="🔄 Update Ticket Status" onClose={onClose}>
      <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'16px'}}>
        Ticket: <strong>{ticket?.resourceOrLocation}</strong>
      </p>
      <label style={{fontSize:'13px',fontWeight:'600',color:'#374151',display:'block',marginBottom:'8px'}}>New Status</label>
      <select value={status} onChange={e=>setStatus(e.target.value)} style={selectStyle}>
        <option value="">— select status —</option>
        {VALID_STATUSES_FOR_UPDATE.map(s=>(
          <option key={s} value={s}>{STATUS_META[s]?.icon} {STATUS_META[s]?.label||s}</option>
        ))}
      </select>
      {(status==='RESOLVED'||status==='CLOSED') && (
        <>
          <label style={{fontSize:'13px',fontWeight:'600',color:'#374151',display:'block',marginBottom:'8px'}}>Resolution Notes</label>
          <textarea rows={3} placeholder="Describe how the issue was resolved…" value={resolutionNotes} onChange={e=>setNotes(e.target.value)} style={taStyle} />
        </>
      )}
      {err && <p style={{color:'#ef4444',fontSize:'12px',marginTop:'6px'}}>{err}</p>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
        <button onClick={onClose} style={{padding:'9px 22px',borderRadius:'9px',border:'1.5px solid #e5e7eb',background:'#fff',color:'#374151',fontWeight:'600',cursor:'pointer',fontSize:'13px'}}>Cancel</button>
        <button onClick={handleSave} disabled={saving}
          style={{padding:'9px 26px',borderRadius:'9px',border:'none',background:saving?'#a78bfa':'#6a0dad',color:'#fff',fontWeight:'700',cursor:saving?'not-allowed':'pointer',fontSize:'13px'}}>
          {saving?'Saving…':'Update Status'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Reject Modal ────────────────────────────────────────────────
function RejectModal({ open, ticket, onClose, onDone }) {
  const [reason, setReason]  = useState('');
  const [saving, setSaving]  = useState(false);
  const [err, setErr]        = useState('');

  useEffect(() => { if(open){ setReason(''); setErr(''); } }, [open]);

  const handleReject = async () => {
    if (!reason.trim()) { setErr('Rejection reason is required.'); return; }
    setSaving(true); setErr('');
    try {
      await ticketService.adminRejectTicket(ticket.id, reason.trim());
      onDone();
    } catch(e) { setErr(e.message||'Failed to reject.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} title="❌ Reject Ticket" onClose={onClose}>
      <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'16px'}}>
        You are rejecting: <strong>{ticket?.resourceOrLocation}</strong>
      </p>
      <label style={{fontSize:'13px',fontWeight:'600',color:'#374151',display:'block',marginBottom:'8px'}}>
        Rejection Reason <span style={{color:'#ef4444'}}>*</span>
      </label>
      <textarea
        rows={4} placeholder="Explain why this ticket is being rejected…"
        value={reason} onChange={e=>{setReason(e.target.value);setErr('');}}
        style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:`1.5px solid ${err?'#ef4444':'#e5e7eb'}`,fontSize:'14px',color:'#111827',outline:'none',boxSizing:'border-box',resize:'vertical',fontFamily:'inherit'}}
      />
      {err && <p style={{color:'#ef4444',fontSize:'12px',marginTop:'4px'}}>{err}</p>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'20px'}}>
        <button onClick={onClose} style={{padding:'9px 22px',borderRadius:'9px',border:'1.5px solid #e5e7eb',background:'#fff',color:'#374151',fontWeight:'600',cursor:'pointer',fontSize:'13px'}}>Cancel</button>
        <button onClick={handleReject} disabled={saving}
          style={{padding:'9px 26px',borderRadius:'9px',border:'none',background:saving?'#fca5a5':'#ef4444',color:'#fff',fontWeight:'700',cursor:saving?'not-allowed':'pointer',fontSize:'13px'}}>
          {saving?'Rejecting…':'Confirm Reject'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Admin Ticket Detail Panel ────────────────────────────────────
function AdminTicketDetail({ ticketId, technicians, onBack, onUpdate }) {
  const [ticket, setTicket]     = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting]   = useState(false);
  const [postErr, setPostErr]   = useState('');
  const [modal, setModal]       = useState(null); // 'assign'|'status'|'reject'
  const [lightbox, setLightbox] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const [t, c] = await Promise.all([
        ticketService.adminGetTicketById(ticketId),
        ticketService.getComments(ticketId),
      ]);
      setTicket(t);
      setComments(Array.isArray(c)?c:[]);
    } catch(e) { setErr(e.message||'Failed to load.'); }
    finally { setLoading(false); }
  }, [ticketId]);

  useEffect(()=>{ load(); }, [load]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true); setPostErr('');
    try {
      const c = await ticketService.addComment(ticketId, newComment.trim());
      setComments(p=>[...p, c]);
      setNewComment('');
    } catch(e){ setPostErr(e.message||'Failed to post.'); }
    finally{ setPosting(false); }
  };

  const afterModalAction = () => { setModal(null); load(); if(onUpdate) onUpdate(); };

  if(loading) return <div style={{textAlign:'center',padding:'80px',color:'#6a0dad',fontWeight:'600'}}>⏳ Loading ticket…</div>;
  if(err)     return <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:'12px',padding:'18px',color:'#b91c1c',margin:'24px 0'}}>{err}</div>;
  if(!ticket) return null;

  const sm = STATUS_META[ticket.status]||STATUS_META.OPEN;
  const pm = PRIORITY_META[ticket.priority]||PRIORITY_META.MEDIUM;
  const card = { background:'#fff',borderRadius:'16px',border:'1px solid #e5e7eb',boxShadow:'0 1px 5px rgba(0,0,0,0.05)',padding:'24px',marginBottom:'18px' };
  const sTitle = (t) => <h3 style={{fontSize:'13px',fontWeight:'700',color:'#6a0dad',margin:'0 0 16px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{t}</h3>;

  return (
    <div style={{maxWidth:'820px',margin:'0 auto',fontFamily:'DM Sans,sans-serif'}}>
      {/* Back */}
      <button onClick={onBack} style={{background:'none',border:'none',color:'#6a0dad',cursor:'pointer',fontWeight:'600',fontSize:'14px',marginBottom:'16px',padding:0}}>
        ← Back to All Tickets
      </button>

      {/* Header */}
      <div style={{marginBottom:'22px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
          <h2 style={{fontSize:'20px',fontWeight:'700',color:'#111827',margin:0}}>{ticket.title||ticket.resourceOrLocation}</h2>
          <Badge meta={STATUS_META} value={ticket.status}/>
          <Badge meta={PRIORITY_META} value={ticket.priority}/>
        </div>
        <p style={{color:'#9ca3af',fontSize:'12px',fontFamily:'monospace',marginTop:'6px'}}>#{ticket.id?.slice(-8).toUpperCase()}</p>
      </div>

      {/* Admin action buttons */}
      <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'22px'}}>
        <button onClick={()=>setModal('assign')}
          style={{padding:'9px 18px',borderRadius:'9px',border:'none',background:'#6a0dad',color:'#fff',fontWeight:'700',cursor:'pointer',fontSize:'13px'}}>
          👷 {ticket.assignedTo?'Reassign':'Assign'} Technician
        </button>
        <button onClick={()=>setModal('status')}
          style={{padding:'9px 18px',borderRadius:'9px',border:'1.5px solid #6a0dad',background:'#fff',color:'#6a0dad',fontWeight:'700',cursor:'pointer',fontSize:'13px'}}>
          🔄 Update Status
        </button>
        {ticket.status!=='REJECTED'&&ticket.status!=='CLOSED'&&(
          <button onClick={()=>setModal('reject')}
            style={{padding:'9px 18px',borderRadius:'9px',border:'none',background:'#ef4444',color:'#fff',fontWeight:'700',cursor:'pointer',fontSize:'13px'}}>
            ❌ Reject Ticket
          </button>
        )}
      </div>

      {/* Alert boxes */}
      {ticket.status==='REJECTED'&&ticket.rejectionReason&&(
        <div style={{background:'#fef2f2',border:'1.5px solid #fca5a5',borderRadius:'12px',padding:'14px 18px',marginBottom:'18px'}}>
          <p style={{fontWeight:'700',color:'#dc2626',marginBottom:'4px'}}>❌ Rejection Reason</p>
          <p style={{color:'#7f1d1d',fontSize:'14px',margin:0}}>{ticket.rejectionReason}</p>
        </div>
      )}
      {(ticket.status==='RESOLVED'||ticket.status==='CLOSED')&&ticket.resolutionNotes&&(
        <div style={{background:'#ecfdf5',border:'1.5px solid #6ee7b7',borderRadius:'12px',padding:'14px 18px',marginBottom:'18px'}}>
          <p style={{fontWeight:'700',color:'#065f46',marginBottom:'4px'}}>✅ Resolution Notes</p>
          <p style={{color:'#064e3b',fontSize:'14px',margin:0}}>{ticket.resolutionNotes}</p>
        </div>
      )}

      {/* Details grid */}
      <div style={card}>
        {sTitle('📋 Ticket Details')}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:'16px'}}>
          {[
            ['Location',     ticket.resourceOrLocation||'—'],
            ['Category',     (ticket.category||'—').replace('_',' ')],
            ['Created By',   ticket.createdBy?(ticket.createdBy.fullName||ticket.createdBy.email):'—'],
            ['Created',      ticket.createdAt?new Date(ticket.createdAt).toLocaleString('en-GB'):'—'],
            ['Updated',      ticket.updatedAt?new Date(ticket.updatedAt).toLocaleString('en-GB'):'—'],
            ['Assigned To',  ticket.assignedTo?(ticket.assignedTo.fullName||ticket.assignedTo.email):'Not assigned'],
          ].map(([label,value])=>(
            <div key={label}>
              <p style={{fontSize:'11px',fontWeight:'700',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.05em',margin:'0 0 4px'}}>{label}</p>
              <p style={{fontSize:'14px',fontWeight:'500',color:'#111827',margin:0}}>{value}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:'16px'}}>
          <p style={{fontSize:'11px',fontWeight:'700',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.05em',margin:'0 0 6px'}}>Description</p>
          <p style={{fontSize:'14px',color:'#374151',margin:0,lineHeight:'1.6',whiteSpace:'pre-wrap'}}>{ticket.description||'—'}</p>
        </div>
      </div>

      {/* Contact */}
      {(ticket.preferredContactName||ticket.preferredContactEmail||ticket.preferredContactPhone)&&(
        <div style={card}>
          {sTitle('📞 Preferred Contact')}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'14px'}}>
            {ticket.preferredContactName&&<div><p style={{fontSize:'11px',fontWeight:'700',color:'#9ca3af',textTransform:'uppercase',margin:'0 0 4px'}}>Name</p><p style={{fontSize:'14px',color:'#111827',margin:0,fontWeight:'500'}}>{ticket.preferredContactName}</p></div>}
            {ticket.preferredContactEmail&&<div><p style={{fontSize:'11px',fontWeight:'700',color:'#9ca3af',textTransform:'uppercase',margin:'0 0 4px'}}>Email</p><a href={`mailto:${ticket.preferredContactEmail}`} style={{fontSize:'14px',color:'#6a0dad',fontWeight:'500'}}>{ticket.preferredContactEmail}</a></div>}
            {ticket.preferredContactPhone&&<div><p style={{fontSize:'11px',fontWeight:'700',color:'#9ca3af',textTransform:'uppercase',margin:'0 0 4px'}}>Phone</p><p style={{fontSize:'14px',color:'#111827',margin:0,fontWeight:'500'}}>{ticket.preferredContactPhone}</p></div>}
          </div>
        </div>
      )}

      {/* Images */}
      {ticket.imageAttachments?.length>0&&(
        <div style={card}>
          {sTitle('📷 Photo Evidence')}
          <div style={{display:'flex',gap:'14px',flexWrap:'wrap'}}>
            {ticket.imageAttachments.map((src,i)=>(
              <img key={i} src={src} alt={`att-${i+1}`} onClick={()=>setLightbox(src)}
                style={{width:'110px',height:'110px',objectFit:'cover',borderRadius:'10px',border:'2px solid #e5e7eb',cursor:'pointer'}}/>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox&&<div onClick={()=>setLightbox(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,cursor:'zoom-out'}}><img src={lightbox} alt="full" style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:'12px'}}/></div>}

      {/* Comments */}
      <div style={card}>
        {sTitle(`💬 Comments (${comments.length})`)}
        {comments.length===0
          ? <p style={{color:'#9ca3af',fontSize:'14px',textAlign:'center',padding:'16px 0'}}>No comments yet.</p>
          : <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'18px'}}>
              {comments.map(c=>{
                const author=c.author?(c.author.fullName||c.author.email||'User'):'User';
                const initials=author.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
                return(
                  <div key={c.id} style={{display:'flex',gap:'12px',padding:'12px 14px',background:'#faf5ff',borderRadius:'12px',border:'1px solid #ede9fe'}}>
                    <div style={{width:'34px',height:'34px',borderRadius:'50%',flexShrink:0,background:'#6a0dad',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'12px'}}>{initials}</div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                        <span style={{fontWeight:'700',color:'#111827',fontSize:'13px'}}>{author}</span>
                        <span style={{color:'#9ca3af',fontSize:'11px'}}>{c.createdAt?new Date(c.createdAt).toLocaleString('en-GB'):''}</span>
                      </div>
                      <p style={{margin:0,color:'#374151',fontSize:'13px',lineHeight:'1.5',whiteSpace:'pre-wrap'}}>{c.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
        }
        {/* Add admin comment */}
        <p style={{fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'8px'}}>Add Admin Comment</p>
        <textarea rows={3} placeholder="Add a note or update for the student…" value={newComment} onChange={e=>{setNewComment(e.target.value);setPostErr('');}}
          style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1.5px solid #e5e7eb',fontSize:'14px',color:'#111827',resize:'vertical',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
        {postErr&&<p style={{color:'#ef4444',fontSize:'12px',margin:'4px 0 0'}}>{postErr}</p>}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:'10px'}}>
          <button onClick={handlePostComment} disabled={posting||!newComment.trim()}
            style={{padding:'9px 24px',borderRadius:'9px',border:'none',background:posting||!newComment.trim()?'#a78bfa':'#6a0dad',color:'#fff',fontWeight:'700',cursor:posting||!newComment.trim()?'not-allowed':'pointer',fontSize:'13px'}}>
            {posting?'⏳ Posting…':'💬 Post Comment'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <AssignModal open={modal==='assign'} ticket={ticket} technicians={technicians} onClose={()=>setModal(null)} onDone={afterModalAction}/>
      <StatusModal open={modal==='status'} ticket={ticket} onClose={()=>setModal(null)} onDone={afterModalAction}/>
      <RejectModal open={modal==='reject'} ticket={ticket} onClose={()=>setModal(null)} onDone={afterModalAction}/>
    </div>
  );
}

// ─── Main Admin Ticket Panel (list view) ─────────────────────────
export default function AdminTicketPanel() {
  const [tickets,      setTickets]      = useState([]);
  const [technicians,  setTechnicians]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [err,          setErr]          = useState('');
  const [viewId,       setViewId]       = useState(null); // detail view

  // filters
  const [fStatus,   setFStatus]   = useState('ALL');
  const [fPriority, setFPriority] = useState('ALL');
  const [fCat,      setFCat]      = useState('ALL');
  const [fSearch,   setFSearch]   = useState('');

  // inline modals on list row
  const [modalType,   setModalType]   = useState(null);
  const [modalTicket, setModalTicket] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const [t, tech] = await Promise.all([
        ticketService.adminGetAllTickets(),
        ticketService.adminGetTechnicians(),
      ]);
      setTickets(Array.isArray(t)?t:[]);
      setTechnicians(Array.isArray(tech)?tech:[]);
    } catch(e){ setErr(e.message||'Failed to load tickets.'); }
    finally{ setLoading(false); }
  }, []);

  useEffect(()=>{ loadAll(); }, [loadAll]);

  // ---- If detail view is open ----
  if (viewId) {
    return (
      <AdminTicketDetail
        ticketId={viewId}
        technicians={technicians}
        onBack={()=>setViewId(null)}
        onUpdate={loadAll}
      />
    );
  }

  // ---- Stats ----
  const openCount      = tickets.filter(t=>t.status==='OPEN').length;
  const inProgressCount= tickets.filter(t=>t.status==='IN_PROGRESS').length;
  const resolvedCount  = tickets.filter(t=>t.status==='RESOLVED'||t.status==='CLOSED').length;
  const criticalCount  = tickets.filter(t=>t.priority==='CRITICAL'&&(t.status==='OPEN'||t.status==='IN_PROGRESS')).length;

  // ---- Filtering ----
  const filtered = tickets.filter(t => {
    if (fStatus!=='ALL' && t.status!==fStatus) return false;
    if (fPriority!=='ALL' && t.priority!==fPriority) return false;
    if (fCat!=='ALL' && t.category!==fCat) return false;
    if (fSearch.trim()) {
      const q = fSearch.toLowerCase();
      const match = [
        t.resourceOrLocation, t.description, t.id,
        t.createdBy?.fullName, t.createdBy?.email,
        t.assignedTo?.fullName, t.assignedTo?.email,
        t.category, t.status,
      ].some(v=>(v||'').toLowerCase().includes(q));
      if(!match) return false;
    }
    return true;
  });

  // ---- Priority sort: HIGH/CRITICAL first ----
  const PRIORITY_ORDER = { HIGH: 0, CRITICAL: 1, MEDIUM: 2, LOW: 3 };
  const sortedFiltered = [...filtered].sort((a, b) =>
    (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)
  );

  // ---- High-priority alert count (open/in-progress HIGH or CRITICAL tickets) ----
  const highPriorityAlertCount = tickets.filter(t =>
    (t.priority === 'HIGH' || t.priority === 'CRITICAL') &&
    (t.status === 'OPEN' || t.status === 'IN_PROGRESS')
  ).length;

  const sel = { padding:'8px 12px',borderRadius:'8px',border:'1.5px solid #e5e7eb',fontSize:'13px',color:'#374151',background:'#fff',cursor:'pointer',outline:'none' };

  const openModal = (type, ticket) => { setModalType(type); setModalTicket(ticket); };
  const closeModal = () => { setModalType(null); setModalTicket(null); };
  const afterAction = () => { closeModal(); loadAll(); };

  return (
    <div style={{maxWidth:'1200px',margin:'0 auto',fontFamily:'DM Sans,sans-serif'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
        <div>
          <h2 style={{fontSize:'22px',fontWeight:'700',color:'#111827',margin:0}}>🎫 All Tickets</h2>
          <p style={{color:'#6b7280',fontSize:'14px',marginTop:'4px'}}>Manage all campus maintenance and incident tickets.</p>
        </div>
        <button onClick={loadAll} style={{padding:'9px 18px',borderRadius:'9px',border:'1.5px solid #e5e7eb',background:'#fff',color:'#374151',fontWeight:'600',cursor:'pointer',fontSize:'13px'}}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}}>
        {[
          {label:'Open', value:openCount, color:'#2563eb', bg:'#eff6ff', icon:'📬'},
          {label:'In Progress', value:inProgressCount, color:'#d97706', bg:'#fffbeb', icon:'🔧'},
          {label:'Resolved / Closed', value:resolvedCount, color:'#059669', bg:'#ecfdf5', icon:'✅'},
          {label:'Critical Pending', value:criticalCount, color:'#dc2626', bg:'#fef2f2', icon:'🚨'},
        ].map(s=>(
          <div key={s.label} style={{background:s.bg,borderRadius:'14px',padding:'18px 20px',border:`1.5px solid ${s.color}30`}}>
            <p style={{fontSize:'24px',fontWeight:'800',color:s.color,margin:'0 0 4px'}}>{s.icon} {s.value}</p>
            <p style={{fontSize:'12px',fontWeight:'600',color:s.color,margin:0,opacity:0.8}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #e5e7eb',padding:'16px 20px',marginBottom:'18px',display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'center'}}>
        <input type="text" placeholder="🔍 Search ticket, student, location…"
          value={fSearch} onChange={e=>setFSearch(e.target.value)}
          style={{...sel,flex:'1',minWidth:'200px',padding:'8px 14px'}}/>
        <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={sel}>
          <option value="ALL">All Statuses</option>
          {ALL_STATUSES.map(s=><option key={s} value={s}>{STATUS_META[s]?.icon} {STATUS_META[s]?.label||s}</option>)}
        </select>
        <select value={fPriority} onChange={e=>setFPriority(e.target.value)} style={sel}>
          <option value="ALL">All Priorities</option>
          {ALL_PRIORITIES.map(p=><option key={p} value={p}>{PRIORITY_META[p]?.label}</option>)}
        </select>
        <select value={fCat} onChange={e=>setFCat(e.target.value)} style={sel}>
          <option value="ALL">All Categories</option>
          {ALL_CATS.map(c=><option key={c} value={c}>{c.replace('_',' ')}</option>)}
        </select>
        {(fStatus!=='ALL'||fPriority!=='ALL'||fCat!=='ALL'||fSearch)&&(
          <button onClick={()=>{setFStatus('ALL');setFPriority('ALL');setFCat('ALL');setFSearch('');}}
            style={{padding:'8px 14px',borderRadius:'8px',border:'1.5px solid #fca5a5',color:'#dc2626',background:'#fef2f2',fontWeight:'600',cursor:'pointer',fontSize:'13px'}}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ⚠ High Priority Alert Banner */}
      {!loading && !err && highPriorityAlertCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#fef2f2', border: '1.5px solid #fca5a5',
          borderRadius: '12px', padding: '12px 18px', marginBottom: '16px',
          color: '#b91c1c', fontWeight: '700', fontSize: '14px',
        }}>
          <span style={{ fontSize: '18px' }}>⚠</span>
          You have <span style={{ fontWeight: '800', margin: '0 4px' }}>{highPriorityAlertCount}</span> high priority ticket{highPriorityAlertCount > 1 ? 's' : ''} requiring attention
        </div>
      )}

      <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'14px'}}>
        Showing <strong>{sortedFiltered.length}</strong> of <strong>{tickets.length}</strong> tickets
      </p>

      {/* Error */}
      {err&&!loading&&<div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:'12px',padding:'18px',color:'#b91c1c',fontWeight:'600',marginBottom:'16px'}}>❌ {err}</div>}

      {/* Loading */}
      {loading&&<div style={{textAlign:'center',padding:'60px',color:'#6a0dad',fontWeight:'600'}}>⏳ Loading tickets…</div>}

      {/* Empty */}
      {!loading&&!err&&filtered.length===0&&(
        <div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'12px'}}>📋</div>
          <h3 style={{color:'#374151',fontWeight:'700',marginBottom:'8px'}}>
            {tickets.length===0?'No tickets in the system yet':'No matching tickets'}
          </h3>
        </div>
      )}

      {/* Table */}
      {!loading&&!err&&sortedFiltered.length>0&&(
        <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#6a0dad',color:'#fff'}}>
                {['ID','Student','Location / Category','Priority','Status','Assigned To','Created','Actions'].map(h=>(
                  <th key={h} style={{padding:'12px 14px',fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedFiltered.map((t, idx)=>{
                const shortId = '#'+(t.id||'').slice(-6).toUpperCase();
                const student = t.createdBy?(t.createdBy.fullName||t.createdBy.email||'—'):'—';
                const assigned= t.assignedTo?(t.assignedTo.fullName||t.assignedTo.email):'—';
                const date    = t.createdAt?new Date(t.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—';
                const isHighPriority = t.priority === 'HIGH' || t.priority === 'CRITICAL';
                const rowBg = isHighPriority ? '#fff8f8' : (idx%2===0?'#fff':'#fafafa');
                return(
                  <tr key={t.id} style={{borderBottom: isHighPriority ? '1px solid #fecaca' : '1px solid #f3f4f6', background: rowBg}}
                    onMouseEnter={e=>e.currentTarget.style.background=isHighPriority?'#fef2f2':'#faf5ff'}
                    onMouseLeave={e=>e.currentTarget.style.background=rowBg}
                  >
                    <td style={{padding:'12px 14px',fontSize:'12px',fontFamily:'monospace',color:'#6b7280'}}>{shortId}</td>
                    <td style={{padding:'12px 14px',fontSize:'13px',fontWeight:'600',color:'#111827'}}>{student}</td>
                    <td style={{padding:'12px 14px'}}>
                      <p style={{fontSize:'13px',fontWeight:'600',color:'#111827',margin:'0 0 2px'}}>{t.resourceOrLocation||'—'}</p>
                      <p style={{fontSize:'11px',color:'#9ca3af',margin:0}}>{(t.category||'').replace('_',' ')}</p>
                    </td>
                    <td style={{padding:'12px 14px'}}><Badge meta={PRIORITY_META} value={t.priority}/></td>
                    <td style={{padding:'12px 14px'}}><Badge meta={STATUS_META} value={t.status}/></td>
                    <td style={{padding:'12px 14px',fontSize:'13px',color:t.assignedTo?'#111827':'#9ca3af'}}>{assigned}</td>
                    <td style={{padding:'12px 14px',fontSize:'12px',color:'#6b7280',whiteSpace:'nowrap'}}>{date}</td>
                    <td style={{padding:'12px 14px'}}>
                      <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                        <button onClick={()=>setViewId(t.id)}
                          style={{padding:'5px 12px',borderRadius:'7px',border:'1.5px solid #6a0dad',background:'#fff',color:'#6a0dad',fontWeight:'700',cursor:'pointer',fontSize:'12px'}}>
                          View
                        </button>
                        <button onClick={()=>openModal('assign',t)}
                          style={{padding:'5px 12px',borderRadius:'7px',border:'none',background:'#6a0dad',color:'#fff',fontWeight:'700',cursor:'pointer',fontSize:'12px'}}>
                          Assign
                        </button>
                        <button onClick={()=>openModal('status',t)}
                          style={{padding:'5px 12px',borderRadius:'7px',border:'1.5px solid #d97706',background:'#fffbeb',color:'#d97706',fontWeight:'700',cursor:'pointer',fontSize:'12px'}}>
                          Status
                        </button>
                        {t.status!=='REJECTED'&&t.status!=='CLOSED'&&(
                          <button onClick={()=>openModal('reject',t)}
                            style={{padding:'5px 12px',borderRadius:'7px',border:'none',background:'#fef2f2',color:'#dc2626',fontWeight:'700',cursor:'pointer',fontSize:'12px'}}>
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AssignModal open={modalType==='assign'} ticket={modalTicket} technicians={technicians} onClose={closeModal} onDone={afterAction}/>
      <StatusModal open={modalType==='status'} ticket={modalTicket} onClose={closeModal} onDone={afterAction}/>
      <RejectModal open={modalType==='reject'} ticket={modalTicket} onClose={closeModal} onDone={afterAction}/>
    </div>
  );
}
