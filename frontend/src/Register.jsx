import React, { useState } from 'react';

export default function Register({ setCurrentPage }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    reEnterPassword: '',
    role: 'Student'
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({...formData, password: newPassword});
    
    // Real-time validation for password match
    if (formData.reEnterPassword && newPassword !== formData.reEnterPassword) {
      setErrors(prev => ({
        ...prev,
        reEnterPassword: 'Passwords do not match'
      }));
    } else if (formData.reEnterPassword && newPassword === formData.reEnterPassword) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.reEnterPassword;
        return newErrors;
      });
    }
  };

  const handleReEnterPasswordChange = (e) => {
    const newReEnterPassword = e.target.value;
    setFormData({...formData, reEnterPassword: newReEnterPassword});
    
    // Real-time validation for password match
    if (formData.password && newReEnterPassword !== formData.password) {
      setErrors(prev => ({
        ...prev,
        reEnterPassword: 'Passwords do not match'
      }));
    } else if (formData.password && newReEnterPassword === formData.password) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.reEnterPassword;
        return newErrors;
      });
    }
  };

  const handleRegister = async () => {
  const newErrors = {};
  
  // validation
  if (!formData.name) {
    newErrors.name = 'Name is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    newErrors.email = 'Email is required';
  } else if (!emailRegex.test(formData.email)) {
    newErrors.email = 'Valid email is required (e.g., example@domain.com)';
  }
  if (!formData.password) {
    newErrors.password = 'Password is required';
  }
  if (!formData.reEnterPassword) {
    newErrors.reEnterPassword = 'Please re-enter password';
  }
  if (formData.password !== formData.reEnterPassword) {
    newErrors.reEnterPassword = 'Passwords do not match';
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }

  setSubmitError('');

  try {
    const res = await fetch('http://localhost:8082/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
    });

    const data = await res.json();

    if (res.ok) {
      if (formData.role.toLowerCase() === 'student') {
        alert("Student registered successfully! You can now use your email and password to log in to the Student Dashboard.");
      } else if (formData.role.toLowerCase() === 'lecturer') {
        alert("Lecturer registered successfully! Please wait for the Admin to approve your account before you can log in to your dashboard.");
      } else if (formData.role.toLowerCase() === 'technician') {
        alert("Technician registered successfully! Please wait for the Admin to approve your account before you can log in to your dashboard.");
      } else {
        alert("Registered successfully. Wait for admin approval.");
      }
      setCurrentPage('signin');
    } else {
      setSubmitError(data.message || "Registration failed");
      alert(data.message || "Registration failed");
    }
  } catch (err) {
    console.error(err);
    setSubmitError("Server error. Please ensure the backend is running.");
    alert("Server error");
  }
};

  const handleBackToLogin = () => {
    setCurrentPage('signin');
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
            Create New Account
          </h1>
          <p style={{ color: '#6a0dad', fontSize: '16px' }}>
            Register for campus access
          </p>
        </div>

        {/* Registration Form */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: '500' }}>
              User Name
            </label>
            <input
              type="text"
              autoComplete="off"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
              placeholder="Enter user name"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              autoComplete="new-email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
              placeholder="Enter your email"
            />
            {errors.email && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                {errors.email}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: '500' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={handlePasswordChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.password ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
                placeholder="Enter your password"
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: '500' }}>
              Re-enter Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showRePassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.reEnterPassword}
                onChange={handleReEnterPasswordChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.reEnterPassword ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowRePassword(!showRePassword)}
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
                {showRePassword ? (
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
            {errors.reEnterPassword && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                {errors.reEnterPassword}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: '500' }}>
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
            >
              <option value="Student">Student</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Technician">Technician</option>
            </select>
          </div>

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
            onClick={handleRegister}
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
            Confirm
          </button>

          <button
            onClick={handleBackToLogin}
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
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
