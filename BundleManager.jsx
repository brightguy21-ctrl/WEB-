import React, { useState, useEffect } from 'react';
import { bundleService } from '../../services/bundleService';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function BundleManager() {
  const [bundles, setBundles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    amountGB: '',
    price: '',
    description: '',
    validity: '30days',
    bundleType: 'one-time', // one-time, subscription
    isActive: true,
  });

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      setLoading(true);
      const data = await bundleService.getAllBundles();
      setBundles(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (editingId) {
        await bundleService.updateBundle(user.uid, editingId, formData);
        toast.success('Bundle updated successfully');
      } else {
        await bundleService.createBundle(user.uid, formData);
        toast.success('Bundle created successfully');
      }

      setFormData({
        name: '',
        amountGB: '',
        price: '',
        description: '',
        validity: '30days',
        bundleType: 'one-time',
        isActive: true,
      });
      setShowForm(false);
      setEditingId(null);
      loadBundles();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bundle) => {
    setFormData({
      name: bundle.name,
      amountGB: bundle.amountGB,
      price: bundle.price,
      description: bundle.description,
      validity: bundle.validity,
      bundleType: bundle.bundleType,
      isActive: bundle.isActive,
    });
    setEditingId(bundle.id);
    setShowForm(true);
  };

  const handleDelete = async (bundleId) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) return;

    try {
      setLoading(true);
      await bundleService.deleteBundle(user.uid, bundleId);
      toast.success('Bundle deleted successfully');
      loadBundles();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bundle-manager">
      <div className="manager-header">
        <h2>Bundle Manager</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          className="btn btn-primary"
        >
          {showForm ? '✕ Cancel' : '+ Add Bundle'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bundle-form">
          <div className="form-group">
            <label>Bundle Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., 5GB Daily"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount (GB)</label>
              <input
                type="number"
                value={formData.amountGB}
                onChange={(e) => setFormData({ ...formData, amountGB: e.target.value })}
                placeholder="e.g., 5"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (USD)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 0.99"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Validity</label>
              <select
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
              >
                <option value="1day">1 Day</option>
                <option value="7days">7 Days</option>
                <option value="30days">30 Days</option>
                <option value="60days">60 Days</option>
                <option value="90days">90 Days</option>
              </select>
            </div>

            <div className="form-group">
              <label>Bundle Type</label>
              <select
                value={formData.bundleType}
                onChange={(e) => setFormData({ ...formData, bundleType: e.target.value })}
              >
                <option value="one-time">One-Time Purchase</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Bundle description..."
              rows="3"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : editingId ? 'Update Bundle' : 'Create Bundle'}
          </button>
        </form>
      )}

      <div className="bundles-list">
        {loading && !showForm ? (
          <p>Loading bundles...</p>
        ) : bundles.length === 0 ? (
          <p className="no-data">No bundles yet. Create your first bundle!</p>
        ) : (
          bundles.map(bundle => (
            <div key={bundle.id} className="bundle-card">
              <div className="bundle-header">
                <h3>{bundle.name}</h3>
                <span className={`badge ${bundle.bundleType}`}>
                  {bundle.bundleType === 'one-time' ? 'One-Time' : 'Subscription'}
                </span>
              </div>

              <div className="bundle-details">
                <div>
                  <strong>{bundle.amountGB}GB</strong>
                  <p>Data</p>
                </div>
                <div>
                  <strong>${bundle.price}</strong>
                  <p>Price</p>
                </div>
                <div>
                  <strong>{bundle.validity}</strong>
                  <p>Validity</p>
                </div>
                <div>
                  <strong>{bundle.totalSold || 0}</strong>
                  <p>Sold</p>
                </div>
              </div>

              <p className="bundle-description">{bundle.description}</p>

              <div className="bundle-actions">
                <button
                  onClick={() => handleEdit(bundle)}
                  className="btn btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(bundle.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
