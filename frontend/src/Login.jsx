import React, { useState } from 'react';

export default function Login({ setCurrentPage }) {
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const handleGoogleLogin = () => {
    // Simple Google OAuth redirect
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
      'client_id=985678395952-c50169jkdosp9hetfdor0ou8ok6dagqi.apps.googleusercontent.com&' +
      'redirect_uri=http://localhost:5173&' +
      'response_type=token&' +
      'scope=email profile&' +
      'include_granted_scopes=true';
    
    window.location.href = googleAuthUrl;
  };

  const handleCreateAccount = () => {
    setCurrentPage('register');
  };

  const handleLogin = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return;
    } else if (!emailRegex.test(email)) {
      setEmailError('Valid email is required (e.g., example@domain.com)');
      return;
    }
    setEmailError('');
    alert('Login functionality coming soon!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#6a0dad',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#6a0dad',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>SC</span>
          </div>
          <h1 style={{
            color: '#1f2937',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '16px 0 8px'
          }}>
            Smart Campus Login
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Sign in to access campus operations
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Email"
              autoComplete="new-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#ffffff',
                color: '#000000',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {emailError && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px', textAlign: 'left' }}>
                {emailError}
              </div>
            )}
          </div>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#ffffff',
                color: '#000000',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6a0dad',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#6a0dad',
            color: 'white',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          Sign In
        </button>

        <button
          onClick={handleCreateAccount}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #6a0dad',
            backgroundColor: 'white',
            color: '#6a0dad',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          Create New Account
        </button>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#4285f4',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}