import React, { useState, useRef } from 'react';
import ticketService from '../../services/ticketService';

const CATEGORIES = [
  { value: 'ELECTRICAL', label: '⚡ Electrical' },
  { value: 'PLUMBING', label: '🚿 Plumbing' },
  { value: 'IT_EQUIPMENT', label: '💻 IT Equipment' },
  { value: 'HVAC', label: '❄️ HVAC / Air Conditioning' },
  { value: 'STRUCTURAL', label: '🏗️ Structural / Building' },
  { value: 'CLEANING', label: '🧹 Cleaning' },
  { value: 'SECURITY', label: '🔒 Security' },
  { value: 'FURNITURE', label: '🪑 Furniture' },
  { value: 'OTHER', label: '📋 Other' },
];

const PRIORITIES = [
  { value: 'LOW', label: '🟢 Low', color: '#10b981' },
  { value: 'MEDIUM', label: '🟡 Medium', color: '#f59e0b' },
  { value: 'HIGH', label: '🟠 High', color: '#f97316' },
  { value: 'CRITICAL', label: '🔴 Critical', color: '#ef4444' },
];

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '14px',
  backgroundColor: '#ffffff',
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '6px',
};

const errorStyle = {
  color: '#ef4444',
  fontSize: '12px',
  marginTop: '4px',
};

export default function CreateTicket({ onSuccess, onCancel }) {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    resourceOrLocation: '',
    category: '',
    priority: 'MEDIUM',
    description: '',
    preferredContactName: '',
    preferredContactEmail: '',
    preferredContactPhone: '',
  });

  const [images, setImages] = useState([]); // array of { file, dataUrl }
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [submitError, setSubmitError] = useState('');

  // ---- Validation ----
  const validate = () => {
    const e = {};
    if (!form.resourceOrLocation.trim()) e.resourceOrLocation = 'Resource / location is required.';
    if (!form.category) e.category = 'Please select a category.';
    if (!form.priority) e.priority = 'Please select a priority.';
    if (!form.description.trim()) {
      e.description = 'Description is required.';
    } else if (form.description.trim().length < 10) {
      e.description = 'Description must be at least 10 characters.';
    } else if (form.description.trim().length > 2000) {
      e.description = 'Description cannot exceed 2000 characters.';
    }
    if (form.preferredContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.preferredContactEmail)) {
      e.preferredContactEmail = 'Please enter a valid email address.';
    }
    if (form.preferredContactPhone && !/^[+\d\s\-().]{7,20}$/.test(form.preferredContactPhone)) {
      e.preferredContactPhone = 'Please enter a valid phone number (7–20 digits).';
    }
    if (images.length > 3) e.images = 'Maximum 3 images allowed.';
    return e;
  };

  // ---- Handle image selection ----
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 3 - images.length;
    if (remaining <= 0) return;

    const toAdd = files.slice(0, remaining);
    const promises = toAdd.map(
      (file) =>
        new Promise((resolve, reject) => {
          if (!file.type.startsWith('image/')) {
            reject(new Error(`"${file.name}" is not an image file.`));
            return;
          }
          const reader = new FileReader();
          reader.onload = (ev) => resolve({ file, dataUrl: ev.target.result });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(promises)
      .then((results) => {
        setImages((prev) => [...prev, ...results]);
        setErrors((prev) => ({ ...prev, images: undefined }));
      })
      .catch((err) => {
        setErrors((prev) => ({ ...prev, images: err.message }));
      });

    // Reset file input so same file can be re-selected after removal
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Handle submit ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMsg('');

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        resourceOrLocation: form.resourceOrLocation.trim(),
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
        preferredContactName: form.preferredContactName.trim() || undefined,
        preferredContactEmail: form.preferredContactEmail.trim() || undefined,
        preferredContactPhone: form.preferredContactPhone.trim() || undefined,
        imageAttachments: images.map((img) => img.dataUrl),
      };

      const created = await ticketService.createTicket(payload);
      setSuccessMsg(`✅ Ticket submitted successfully! Reference: #${created.id ? created.id.slice(-8).toUpperCase() : 'N/A'}`);

      // Reset form
      setForm({
        resourceOrLocation: '',
        category: '',
        priority: 'MEDIUM',
        description: '',
        preferredContactName: '',
        preferredContactEmail: '',
        preferredContactPhone: '',
      });
      setImages([]);

      if (onSuccess) setTimeout(() => onSuccess(created), 1500);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    style: {
      ...inputStyle,
      borderColor: errors[key] ? '#ef4444' : '#e5e7eb',
    },
  });

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>
          🔧 Report an Issue
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '6px' }}>
          Fill in the details below to submit a maintenance or incident ticket.
        </p>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div style={{
          background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '10px',
          padding: '14px 18px', marginBottom: '20px', color: '#065f46', fontWeight: '600',
        }}>
          {successMsg}
        </div>
      )}

      {/* Error Banner */}
      {submitError && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px',
          padding: '14px 18px', marginBottom: '20px', color: '#b91c1c', fontWeight: '600',
        }}>
          ❌ {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)', padding: '28px', marginBottom: '20px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#6a0dad', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Issue Details
          </h3>

          {/* Resource / Location */}
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Resource / Location <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" placeholder="e.g. Lab C201, Block A Corridor, Main Hall …" {...field('resourceOrLocation')} />
            {errors.resourceOrLocation && <p style={errorStyle}>{errors.resourceOrLocation}</p>}
          </div>

          {/* Category + Priority side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>Category <span style={{ color: '#ef4444' }}>*</span></label>
              <select {...field('category')} style={{ ...inputStyle, borderColor: errors.category ? '#ef4444' : '#e5e7eb' }}>
                <option value="">— Select category —</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <p style={errorStyle}>{errors.category}</p>}
            </div>
            <div>
              <label style={labelStyle}>Priority <span style={{ color: '#ef4444' }}>*</span></label>
              <select {...field('priority')} style={{ ...inputStyle, borderColor: errors.priority ? '#ef4444' : '#e5e7eb' }}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              {errors.priority && <p style={errorStyle}>{errors.priority}</p>}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle}>Description <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea
              rows={5}
              placeholder="Describe the issue in detail — what happened, when it started, any safety concerns …"
              style={{
                ...inputStyle,
                resize: 'vertical',
                borderColor: errors.description ? '#ef4444' : '#e5e7eb',
              }}
              value={form.description}
              onChange={(e) => {
                setForm((p) => ({ ...p, description: e.target.value }));
                setErrors((p) => ({ ...p, description: undefined }));
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {errors.description
                ? <p style={errorStyle}>{errors.description}</p>
                : <span />}
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{form.description.length}/2000</span>
            </div>
          </div>
        </div>

        {/* Image Attachments Card */}
        <div style={{
          background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)', padding: '28px', marginBottom: '20px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#6a0dad', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Photo Evidence <span style={{ color: '#9ca3af', fontWeight: '400', fontSize: '13px' }}>(optional, max 3)</span>
          </h3>

          {/* Dropzone area */}
          <div
            onClick={() => images.length < 3 && fileInputRef.current?.click()}
            style={{
              border: '2px dashed #d8b4fe',
              borderRadius: '12px',
              padding: '28px',
              textAlign: 'center',
              cursor: images.length < 3 ? 'pointer' : 'default',
              backgroundColor: images.length < 3 ? '#faf5ff' : '#f9fafb',
              transition: 'background 0.2s',
              marginBottom: images.length > 0 ? '16px' : 0,
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
            {images.length < 3 ? (
              <>
                <p style={{ fontWeight: '600', color: '#6a0dad', marginBottom: '4px' }}>Click to add photos</p>
                <p style={{ color: '#9ca3af', fontSize: '13px' }}>JPG, PNG, GIF, WebP — {3 - images.length} slot{3 - images.length !== 1 ? 's' : ''} remaining</p>
              </>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>Maximum 3 images reached</p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
          {errors.images && <p style={{ ...errorStyle, marginTop: '8px' }}>{errors.images}</p>}

          {/* Image previews */}
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: '110px', height: '110px' }}>
                  <img
                    src={img.dataUrl}
                    alt={`attachment-${idx}`}
                    style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e5e7eb' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    title="Remove image"
                    style={{
                      position: 'absolute', top: '-8px', right: '-8px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: '#ef4444', color: '#fff', border: 'none',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Details Card */}
        <div style={{
          background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)', padding: '28px', marginBottom: '28px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#6a0dad', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Preferred Contact <span style={{ color: '#9ca3af', fontWeight: '400', fontSize: '13px' }}>(optional)</span>
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Contact Name</label>
            <input type="text" placeholder="Your name or alternate contact" {...field('preferredContactName')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Contact Email</label>
              <input type="email" placeholder="email@campus.edu" {...field('preferredContactEmail')} />
              {errors.preferredContactEmail && <p style={errorStyle}>{errors.preferredContactEmail}</p>}
            </div>
            <div>
              <label style={labelStyle}>Contact Phone</label>
              <input type="tel" placeholder="+94 71 234 5678" {...field('preferredContactPhone')} />
              {errors.preferredContactPhone && <p style={errorStyle}>{errors.preferredContactPhone}</p>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '11px 28px', borderRadius: '10px', border: '1.5px solid #d1d5db',
                background: '#fff', color: '#374151', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '11px 32px', borderRadius: '10px', border: 'none',
              background: submitting ? '#a78bfa' : '#6a0dad',
              color: '#fff', fontSize: '14px', fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 2px 8px rgba(106,13,173,0.25)',
            }}
          >
            {submitting ? '⏳ Submitting…' : '🚀 Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
