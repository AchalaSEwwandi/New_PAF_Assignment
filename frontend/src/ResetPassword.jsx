import React, { useState, useEffect } from 'react';

export default function ResetPassword({ setCurrentPage }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('Invalid or missing reset token.');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      setError('Passwords must match and cannot be empty.');
      return;
    }

    if (!token) {
      setError('Missing reset token.');
      return;
    }

    fetch('http://localhost:8082/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'Password successfully reset.') {
        setMessage('Password successfully reset! You can now log in.');
        setError('');
        setTimeout(() => setCurrentPage('signin'), 3000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    })
    .catch(err => {
      setError('An error occurred. Please try again.');
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#6a0dad', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Reset Password</h1>

        {message && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{message}</div>}
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '16px', fontSize: '16px', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '24px', fontSize: '16px', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#6a0dad', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '16px' }}>
            Set New Password
          </button>
        </form>

        <button onClick={() => setCurrentPage('signin')} style={{ background: 'none', border: 'none', color: '#6a0dad', cursor: 'pointer', textDecoration: 'underline' }}>
          Back to Login
        </button>
      </div>
    </div>
  );
}
