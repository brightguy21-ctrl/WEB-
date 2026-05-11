import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useBundleStore } from '../../stores/bundleStore';
import BundleManager from './BundleManager';
import StoreSettings from './StoreSettings';
import CustomerSupport from './CustomerSupport';
import Analytics from './Analytics';
import '../styles/admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { bundles, stats } = useBundleStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Verify admin access
    const adminId = process.env.REACT_APP_ADMIN_ID;
    if (user?.uid !== adminId) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="admin-container">
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'bundles' ? 'active' : ''}`}
              onClick={() => setActiveTab('bundles')}
            >
              📦 Bundle Manager
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Store Settings
            </button>
            <button
              className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              💬 Customer Support
            </button>
            <button
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📈 Analytics
            </button>
          </nav>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Bundles</h3>
                  <p className="stat-value">{bundles.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${stats.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Subscriptions</h3>
                  <p className="stat-value">{stats.activeSubscriptions || '0'}</p>
                </div>
                <div className="stat-card">
                  <h3>Today's Sales</h3>
                  <p className="stat-value">{stats.todaysSales || '0'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bundles' && <BundleManager />}
          {activeTab === 'settings' && <StoreSettings />}
          {activeTab === 'support' && <CustomerSupport />}
          {activeTab === 'analytics' && <Analytics />}
        </div>
      </div>
    </div>
  );
}
