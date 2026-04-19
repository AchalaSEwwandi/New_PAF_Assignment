import React, { useState } from 'react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleNavClick = (tab) => {
    setActiveTab(tab);
  };

  const handleNavMouseDown = (e) => {
    e.target.style.outline = '3px solid #1f2937';
    e.target.style.outlineOffset = '3px';
  };

  const handleNavMouseUp = (e) => {
    e.target.style.outline = 'none';
  };

  const handleNavMouseLeave = (e) => {
    e.target.style.outline = 'none';
  };

  const handleSignIn = () => {
    // Simple login simulation
    alert('Login functionality would connect to backend here');
  };

  return (
    <div style={{ backgroundColor: '#6a0dad', minHeight: '100vh', padding: '20px' }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '40px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#475569',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>SC</span>
            </div>
            <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '18px' }}>Smart Campus</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="#" 
               onClick={() => handleNavClick('Dashboard')}
               onMouseDown={handleNavMouseDown}
               onMouseUp={handleNavMouseUp}
               onMouseLeave={handleNavMouseLeave}
               style={{ 
                 backgroundColor: activeTab === 'Dashboard' ? '#8a2be2' : 'transparent',
                 color: '#ffffff', 
                 textDecoration: 'none', 
                 fontSize: '18px', 
                 cursor: 'pointer',
                 padding: '8px 16px',
                 borderRadius: '8px',
                 transition: 'all 0.1s ease',
                 border: activeTab === 'Dashboard' ? 'none' : '1px solid #8a2be2',
                 display: 'inline-block'
               }}>Dashboard</a>
            <a href="#" 
               onClick={() => handleNavClick('Facilities')}
               onMouseDown={handleNavMouseDown}
               onMouseUp={handleNavMouseUp}
               onMouseLeave={handleNavMouseLeave}
               style={{ 
                 backgroundColor: activeTab === 'Facilities' ? '#8a2be2' : 'transparent',
                 color: '#ffffff', 
                 textDecoration: 'none', 
                 fontSize: '18px', 
                 cursor: 'pointer',
                 padding: '8px 16px',
                 borderRadius: '8px',
                 transition: 'all 0.1s ease',
                 border: activeTab === 'Facilities' ? 'none' : '1px solid #8a2be2',
                 display: 'inline-block'
               }}>Facilities</a>
            <a href="#" 
               onClick={() => handleNavClick('Bookings')}
               onMouseDown={handleNavMouseDown}
               onMouseUp={handleNavMouseUp}
               onMouseLeave={handleNavMouseLeave}
               style={{ 
                 backgroundColor: activeTab === 'Bookings' ? '#8a2be2' : 'transparent',
                 color: '#ffffff', 
                 textDecoration: 'none', 
                 fontSize: '18px', 
                 cursor: 'pointer',
                 padding: '8px 16px',
                 borderRadius: '8px',
                 transition: 'all 0.1s ease',
                 border: activeTab === 'Bookings' ? 'none' : '1px solid #8a2be2',
                 display: 'inline-block'
               }}>Bookings</a>
            <a href="#" 
               onClick={() => handleNavClick('Maintenance')}
               onMouseDown={handleNavMouseDown}
               onMouseUp={handleNavMouseUp}
               onMouseLeave={handleNavMouseLeave}
               style={{ 
                 backgroundColor: activeTab === 'Maintenance' ? '#8a2be2' : 'transparent',
                 color: '#ffffff', 
                 textDecoration: 'none', 
                 fontSize: '18px', 
                 cursor: 'pointer',
                 padding: '8px 16px',
                 borderRadius: '8px',
                 transition: 'all 0.1s ease',
                 border: activeTab === 'Maintenance' ? 'none' : '1px solid #8a2be2',
                 display: 'inline-block'
               }}>Maintenance</a>
            <button 
               onClick={handleSignIn}
               onMouseDown={handleNavMouseDown}
               onMouseUp={handleNavMouseUp}
               onMouseLeave={handleNavMouseLeave}
               style={{
                backgroundColor: '#ffffff',
                color: '#6a0dad',
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'outline 0.1s ease',
                marginLeft: '20px'
              }}>Sign in</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
          Manage Your Campus Operations
        </h1>
        <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '32px', maxWidth: '800px', margin: '0 auto 32px' }}>
          Book facilities, report issues, and track maintenance requests all in one unified platform
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            backgroundColor: '#334155',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}>Get started</button>
          <button style={{
            border: '2px solid #ffffff',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '16px'
          }}>Learn more</button>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Facilities Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <span style={{ color: '#ffffff', fontSize: '20px' }}>⚡</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Facilities catalogue
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
              Browse and search lecture halls, labs, meeting rooms and equipment with real-time availability
            </p>
          </div>

          {/* Smart Booking Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <span style={{ color: '#ffffff', fontSize: '20px' }}>📅</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Smart booking
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
              Request and manage bookings with automated conflict detection and approval workflows
            </p>
          </div>

          {/* Maintenance Tickets Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <span style={{ color: '#ffffff', fontSize: '20px' }}>🔧</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Maintenance tickets
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
              Report issues, track progress and communicate with technicians through the full lifecycle
            </p>
          </div>

          {/* Real-time Notifications Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <span style={{ color: '#ffffff', fontSize: '20px' }}>🔔</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Real-time notifications
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
              Stay updated on booking approvals, ticket status changes and important campus updates
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{
        padding: '64px 16px',
        backgroundColor: 'rgba(249, 250, 251, 0.95)',
        backdropFilter: 'blur(5px)',
        borderRadius: '12px',
        marginBottom: '60px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
            Platform statistics
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            <div style={{ 
              textAlign: 'center',
              backgroundColor: '#ffffff',
              padding: '32px 24px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span style={{ color: '#6a0dad', fontSize: '36px' }}>🏠</span>
                150+
              </div>
              <div style={{ color: '#4b5563', fontSize: '16px', fontWeight: '500' }}>Facilities available</div>
            </div>
            <div style={{ 
              textAlign: 'center',
              backgroundColor: '#ffffff',
              padding: '32px 24px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span style={{ color: '#10b981', fontSize: '36px' }}>📅</span>
                2,400+
              </div>
              <div style={{ color: '#4b5563', fontSize: '16px', fontWeight: '500' }}>Bookings this month</div>
            </div>
            <div style={{ 
              textAlign: 'center',
              backgroundColor: '#ffffff',
              padding: '32px 24px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span style={{ color: '#34d399', fontSize: '36px' }}>✓</span>
                95%
              </div>
              <div style={{ color: '#4b5563', fontSize: '16px', fontWeight: '500' }}>Issue resolution rate</div>
            </div>
            <div style={{ 
              textAlign: 'center',
              backgroundColor: '#ffffff',
              padding: '32px 24px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span style={{ color: '#f97316', fontSize: '36px' }}>🕐</span>
                24hr
              </div>
              <div style={{ color: '#4b5563', fontSize: '16px', fontWeight: '500' }}>Average response time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '48px'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
            Ready to streamline your campus?
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
            Join hundreds of staff and students already using Smart Campus for their daily operations
          </p>
          <button style={{
            backgroundColor: '#334155',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}>Sign up with Google</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '32px 16px',
        borderRadius: '12px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ color: '#ffffff' }}>
            © 2026 Smart Campus Operations Hub
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Support</a>
            <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
