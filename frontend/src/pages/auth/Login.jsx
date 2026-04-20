// Placeholder for Login
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Login Placeholder</h2>
            <button onClick={() => navigate('/dashboard')}>Go to Dashboard (Dev Bypass)</button>
        </div>
    );
};
export default Login;
