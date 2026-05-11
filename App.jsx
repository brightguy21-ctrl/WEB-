import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore }     from './stores/authStore';
import AdminDashboard       from './components/AdminDashboard';
import BundleMarketplace    from './components/BundleMarketplace';
import Checkout             from './components/Checkout';
import { AIChat }           from './components/AIChat';

// This protects the /admin route — only your UID can get in
function AdminRoute({ children }) {
  const { user } = useAuthStore();
  const adminId  = import.meta.env.VITE_ADMIN_ID;
  return user?.uid === adminId ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { user }                = useAuthStore();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                     element={<BundleMarketplace />} />
        <Route path="/checkout/:purchaseId" element={<Checkout />} />
        <Route path="/admin"                element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
      </Routes>

      {/* Floating chat button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: 'fixed', bottom: 20, right: 20,
            background: '#2980B9', color: '#fff',
            border: 'none', borderRadius: '50%',
            width: 56, height: 56, fontSize: 24,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          💬
        </button>
      )}
      <AIChat userId={user?.uid} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </BrowserRouter>
  );
