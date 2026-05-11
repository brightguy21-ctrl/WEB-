import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { purchaseId }          = useParams();
  const navigate                = useNavigate();
  const { user }                = useAuthStore();
  const [purchase, setPurchase] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'purchases', purchaseId));
        if (snap.exists()) setPurchase({ id: snap.id, ...snap.data() });
        else toast.error('Purchase not found');
      } catch (e) {
        toast.error('Failed to load purchase details');
      } finally { setLoading(false); }
    };
    load();
  }, [purchaseId]);

  const handlePay = () => {
    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!key || key === 'PASTE_YOUR_PAYSTACK_KEY_HERE') {
      toast.error('Payment not set up yet — see Section 8 of the guide.');
      return;
    }
    const handler = window.PaystackPop.setup({
      key,
      email:    user?.email || 'customer@example.com',
      amount:   (purchase?.amount || 0) * 100, // Paystack uses pesewas (x100)
      currency: 'GHS',
      ref:      purchaseId,
      callback: () => { toast.success('Payment successful! Bundle activating...'); navigate('/'); },
      onClose:  () => toast.error('Payment cancelled.'),
    });
    handler.openIframe();
  };

  if (loading)   return <div style={{ padding: 40 }}>Loading...</div>;
  if (!purchase) return <div style={{ padding: 40 }}>Purchase not found.</div>;

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: 32,
      border: '1px solid #ddd', borderRadius: 12 }}>
      <h2>Complete Your Purchase</h2>
      <p><strong>Bundle:</strong> {purchase.bundleId}</p>
      <p><strong>Phone:</strong> {purchase.phoneNumber}</p>
      <p><strong>Status:</strong> {purchase.status}</p>
      <button onClick={handlePay} style={{
        background: '#27AE60', color: '#fff', padding: '14px 32px',
        border: 'none', borderRadius: 8, fontSize: 16,
        cursor: 'pointer', marginTop: 24, width: '100%' }}>
        Pay with Paystack (GHS)
      </button>
      <button onClick={() => navigate(-1)} style={{
        background: 'transparent', color: '#666', padding: '12px 32px',
        border: '1px solid #ddd', borderRadius: 8,
        cursor: 'pointer', marginTop: 8, width: '100%' }}>
        Go Back
      </button>
    </div>
  );
}
