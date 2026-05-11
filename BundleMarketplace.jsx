import React, { useState, useEffect } from 'react';
import { bundleService } from '../../services/bundleService';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiRefreshCw } from 'react-icons/fi';

export default function BundleMarketplace() {
  const { user } = useAuthStore();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

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

  const filteredBundles = filter === 'all' 
    ? bundles 
    : bundles.filter(b => b.bundleType === filter);

  const handlePurchase = async (bundle) => {
    if (!user?.phoneNumber) {
      toast.error('Please update your phone number in your profile');
      return;
    }

    try {
      setLoading(true);
      const result = await bundleService.purchaseBundle(
        user.uid,
        bundle.id,
        user.phoneNumber
      );

      toast.success('Purchase initiated. Redirecting to payment...');
      // Redirect to payment page
      window.location.href = `/checkout/${result.purchaseId}`;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bundle-marketplace">
      <div className="marketplace-header">
        <h1>Data Bundles</h1>
        <button onClick={loadBundles} className="refresh-btn">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Bundles
        </button>
        <button
          className={`filter-btn ${filter === 'one-time' ? 'active' : ''}`}
          onClick={() => setFilter('one-time')}
        >
          One-Time Purchase
        </button>
        <button
          className={`filter-btn ${filter === 'subscription' ? 'active' : ''}`}
          onClick={() => setFilter('subscription')}
        >
          Subscriptions
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading bundles...</div>
      ) : filteredBundles.length === 0 ? (
        <div className="no-data">No bundles available</div>
      ) : (
        <div className="bundles-grid">
          {filteredBundles.map(bundle => (
            <div key={bundle.id} className="bundle-product-card">
              <div className="bundle-type-badge">
                {bundle.bundleType === 'one-time' ? '⏱️ One-Time' : '🔄 Subscription'}
              </div>

              <h3>{bundle.name}</h3>

              <div className="bundle-highlight">
                <span className="gb">{bundle.amountGB}GB</span>
              </div>

              <div className="bundle-info">
                <div>
                  <strong>Price</strong>
                  <p>${bundle.price}</p>
                </div>
                <div>
                  <strong>Validity</strong>
                  <p>{bundle.validity}</p>
                </div>
              </div>

              <p className="bundle-description">{bundle.description}</p>

              <button
                onClick={() => handlePurchase(bundle)}
                disabled={loading}
                className="btn btn-primary btn-purchase"
              >
                <FiShoppingCart /> Buy Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
