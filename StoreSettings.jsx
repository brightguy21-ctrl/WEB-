import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export default function StoreSettings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    storeName: '',
    storeDescription: '',
    supportEmail: '',
    supportPhone: '',
    currency: 'KES',
  });

  const [customization, setCustomization] = useState({
    primaryColor: '#007AFF',
    secondaryColor: '#5AC8FA',
    accentColor: '#FF9500',
    logoUrl: '',
    bannerUrl: '',
    fontFamily: 'Inter, system-ui, sans-serif',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/settings`,
        { params: { adminId: user.uid } }
      );
      setGeneralSettings(response.data.settings);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/admin/settings`, {
        adminId: user.uid,
        settings: generalSettings,
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomization = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/admin/customization`, {
        adminId: user.uid,
        customization,
      });
      toast.success('Customization saved successfully');
    } catch (error) {
      toast.error('Failed to save customization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-settings">
      <h2>Store Settings</h2>

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab ${activeTab === 'customization' ? 'active' : ''}`}
          onClick={() => setActiveTab('customization')}
        >
          Customization
        </button>
        <button
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment Methods
        </button>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="settings-form">
          <div className="form-group">
            <label>Store Name</label>
            <input
              type="text"
              value={generalSettings.storeName}
              onChange={(e) => setGeneralSettings({
                ...generalSettings,
                storeName: e.target.value
              })}
            />
          </div>

          <div className="form-group">
            <label>Store Description</label>
            <textarea
              value={generalSettings.storeDescription}
              onChange={(e) => setGeneralSettings({
                ...generalSettings,
                storeDescription: e.target.value
              })}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Support Email</label>
              <input
                type="email"
                value={generalSettings.supportEmail}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  supportEmail: e.target.value
                })}
              />
            </div>

            <div className="form-group">
              <label>Support Phone</label>
              <input
                type="tel"
                value={generalSettings.supportPhone}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  supportPhone: e.target.value
                })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select
              value={generalSettings.currency}
              onChange={(e) => setGeneralSettings({
                ...generalSettings,
                currency: e.target.value
              })}
            >
              <option value="USD">USD</option>
              <option value="KES">KES (Kenya)</option>
              <option value="NGN">NGN (Nigeria)</option>
              <option value="GHS">GHS (Ghana)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}

      {activeTab === 'customization' && (
        <form onSubmit={handleSaveCustomization} className="settings-form">
          <div className="color-picker-group">
            <div className="form-group">
              <label>Primary Color</label>
              <input
                type="color"
                value={customization.primaryColor}
                onChange={(e) => setCustomization({
                  ...customization,
                  primaryColor: e.target.value
                })}
              />
              <code>{customization.primaryColor}</code>
            </div>

            <div className="form-group">
              <label>Secondary Color</label>
              <input
                type="color"
                value={customization.secondaryColor}
                onChange={(e) => setCustomization({
                  ...customization,
                  secondaryColor: e.target.value
                })}
              />
              <code>{customization.secondaryColor}</code>
            </div>

            <div className="form-group">
              <label>Accent Color</label>
              <input
                type="color"
                value={customization.accentColor}
                onChange={(e) => setCustomization({
                  ...customization,
                  accentColor: e.target.value
                })}
              />
              <code>{customization.accentColor}</code>
            </div>
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input
              type="url"
              value={customization.logoUrl}
              onChange={(e) => setCustomization({
                ...customization,
                logoUrl: e.target.value
              })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Banner URL</label>
            <input
              type="url"
              value={customization.bannerUrl}
              onChange={(e) => setCustomization({
                ...customization,
                bannerUrl: e.target.value
              })}
              placeholder="https://..."
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : 'Save Customization'}
          </button>
        </form>
      )}
    </div>
  );
}
