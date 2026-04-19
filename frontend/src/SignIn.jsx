import React, { useState, useEffect } from 'react';

export default function SignIn({ setCurrentPage }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showReEnterPassword, setShowReEnterPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    reEnterPassword: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [submitError, setSubmitError] = useState('');

  const validateEmail = (email) => {
    return email.includes('@') && email.includes('.');
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: ''
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email must contain @ symbol';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleGoogleLogin = () => {
    // Step 1: Open Google OAuth popup
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
      'client_id=985678395952-c50169jkdosp9hetfdor0ou8ok6dagqi.apps.googleusercontent.com&' +
      'redirect_uri=http://localhost:5173/auth/callback&' +
      'response_type=token&' +
      'scope=email profile&' +
      'include_granted_scopes=true';
    
    window.open(googleAuthUrl, '_blank', 'width=500,height=600');
  };

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // Step 2: Send token to backend
        fetch('http://localhost:8080/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.jwt) {
            // Step 4: Store JWT and redirect based on role
            localStorage.setItem('jwt', data.jwt);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect based on user role
            if (data.user.role === 'ADMIN') {
              window.location.href = '/admin';
            } else if (data.user.role === 'STUDENT') {
              window.location.href = '/student';
            } else if (data.user.role === 'LECTURER') {
              alert('Your account has been approved. You can now access the dashboard.');
              window.location.href = '/lecturer';
            } else if (data.user.role === 'TECHNICIAN') {
              alert('Your account has been approved. You can now access the dashboard.');
              window.location.href = '/technician';
            } else {
              window.location.href = '/dashboard';
            }
          } else if (data.status === 'PENDING' || data.message?.includes('approval')) {
            alert('Your account is not approved yet. Please wait for admin approval. A notification email will be sent once approved.');
          } else {
            alert('Google login failed: ' + (data.message || 'Authentication failed'));
          }
        })
        .catch(error => {
          console.error('Google login error:', error);
          alert('Google login failed');
        });
      }
    };

    handleGoogleCallback();
  }, []);

  const handleSignIn = () => {
    if (!validateForm()) {
      return; // Don't submit if validation fails
    }

    setSubmitError('');

    // Connect to backend with form data
    const loginData = {
      email: formData.email,
      password: formData.password,
      reEnterPassword: showReEnterPassword ? formData.reEnterPassword : undefined
    };

    console.log('Connecting to backend with:', loginData);
    
    // Backend API call
    fetch('http://localhost:8082/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.jwt) {
        // Store JWT and user data
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on user role
        if (data.user.role === 'ADMIN') {
          window.location.href = '/admin';
        } else if (data.user.role === 'STUDENT') {
          window.location.href = '/student';
        } else if (data.user.role === 'LECTURER') {
          alert('Your account has been approved. You can now access the dashboard.');
          window.location.href = '/lecturer';
        } else if (data.user.role === 'TECHNICIAN') {
          alert('Your account has been approved. You can now access the dashboard.');
          window.location.href = '/technician';
        } else {
          window.location.href = '/dashboard';
        }
      } else if (data.status === 'PENDING' || data.message?.includes('approval') || data.message?.includes('Waiting for admin approval')) {
        setSubmitError('Your account is not approved yet. Please wait for the Admin to approve your account.');
        alert('Your account is not approved yet. Please wait for admin approval. A notification email will be sent once approved.');
      } else {
        // Show error message
        setSubmitError('Login failed: ' + (data.message || 'Invalid credentials'));
        alert('Login failed: ' + (data.message || 'Invalid credentials'));
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      setSubmitError('Login failed: Please check your credentials');
      alert('Login failed: Please check your credentials');
    });
  };

  const handleRegister = () => {
    alert('Registration would connect to backend here');
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
      {/* Form Container - Centered */}
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '450px',
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
          <p style={{ color: '#6a0dad', fontSize: '16px' }}>
            Sign in to access campus operations
          </p>
        </div>

        {/* Login Form */}
        <div>
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
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              marginBottom: '16px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#357ae8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4285f4'}
          >
            Sign in with Google
          </button>

          <div style={{ textAlign: 'center', margin: '20px 0', color: '#6a0dad' }}>
            or
          </div>

          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
  width: '100%',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '16px',
  backgroundColor: '#ffffff',
  color: '#000000',
  marginBottom: '4px',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  outline: 'none',
  boxSizing: 'border-box',
  WebkitBoxShadow: '0 0 0 1000px #ffffff inset',   // ← add
  WebkitTextFillColor: '#000000'                    // ← add
}}
            />
            {errors.email && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                {errors.email}
              </div>
            )}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{
  width: '100%',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '16px',
  backgroundColor: '#ffffff',
  color: '#000000',
  marginBottom: '4px',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  outline: 'none',
  boxSizing: 'border-box',
  WebkitBoxShadow: '0 0 0 1000px #ffffff inset',   // ← add
  WebkitTextFillColor: '#000000'                    // ← add
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
            {errors.password && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                {errors.password}
              </div>
            )}
            {showReEnterPassword && (
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter Password"
                  value={formData.reEnterPassword}
                  onChange={(e) => setFormData({...formData, reEnterPassword: e.target.value})}
                  style={{
  width: '100%',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '16px',
  backgroundColor: '#ffffff',
  color: '#000000',
  marginBottom: '4px',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  outline: 'none',
  boxSizing: 'border-box',
  WebkitBoxShadow: '0 0 0 1000px #ffffff inset',   // ← add
  WebkitTextFillColor: '#000000'                    // ← add
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
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
)}
                </button>
              </div>
            )}

            {submitError && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center',
                border: '1px solid #f87171'
              }}>
                {submitError}
              </div>
            )}

            <button
              onClick={handleSignIn}
              style={{
                width: '100%',
                padding: '12px 24px',
                fontSize: '16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#6a0dad',
                color: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                marginBottom: '16px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a0dad'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6a0dad'}
            >
              Sign In
            </button>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('forgot-password');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6a0dad',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => setCurrentPage('register')}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid #6a0dad',
              backgroundColor: 'transparent',
              color: '#6a0dad',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}
