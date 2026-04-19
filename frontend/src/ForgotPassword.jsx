import React, { useState } from 'react';

export default function ForgotPassword({ setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    fetch('http://localhost:8082/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
      // Backend returns same success message regardless to prevent email enumeration
      setMessage(data.message || 'If that email address is in our database, we will send you an email to reset your password.');
      setError('');
    })
    .catch(err => {
      setError('An error occurred. Please try again.');
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#6a0dad', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Forgot Password</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{message}</div>}
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '24px', fontSize: '16px', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#6a0dad', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '16px' }}>
            Send Reset Link
          </button>
        </form>

        <button onClick={() => setCurrentPage('signin')} style={{ background: 'none', border: 'none', color: '#6a0dad', cursor: 'pointer', textDecoration: 'underline' }}>
          Back to Login
        </button>
      </div>
    </div>
  );
}
