import React from 'react';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '20px' }}>
            <h2>Dashboard Placeholder</h2>
            <button onClick={() => navigate('/resources')}>Go to Resources (Module A)</button>
        </div>
    );
};
export default Dashboard;
