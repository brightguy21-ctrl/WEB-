import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default function CustomerSupport() {
  const { user } = useAuthStore();
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    loadEscalations();
    const interval = setInterval(loadEscalations, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEscalations = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/escalations`,
        { params: { adminId: user.uid } }
      );
      setEscalations(response.data.escalations);
    } catch (error) {
      console.error('Failed to load escalations:', error);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    if (!resolution.trim()) {
      toast.error('Please provide a resolution');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/admin/escalations/${ticketId}/resolve`,
        {
          adminId: user.uid,
          response: resolution,
          notes: '',
        }
      );
      toast.success('Ticket resolved');
      setResolution('');
      setSelectedTicket(null);
      loadEscalations();
    } catch (error) {
      toast.error('Failed to resolve ticket');
    } finally {
      setLoading(false);
    }
  };

  const pendingTickets = escalations.filter(t => t.status === 'pending');
  const resolvedTickets = escalations.filter(t => t.status === 'resolved');

  return (
    <div className="customer-support">
      <h2>Customer Support Center</h2>

      <div className="support-overview">
        <div className="overview-card">
          <h3>Pending Tickets</h3>
          <p className="count">{pendingTickets.length}</p>
        </div>
        <div className="overview-card">
          <h3>Resolved Today</h3>
          <p className="count">{resolvedTickets.length}</p>
        </div>
      </div>

      {selectedTicket && (
        <div className="ticket-detail">
          <div className="detail-header">
            <h3>Ticket #{selectedTicket.id}</h3>
            <button onClick={() => setSelectedTicket(null)} className="close-btn">
              ✕
            </button>
          </div>

          <div className="detail-body">
            <div className="detail-section">
              <h4>Customer Query</h4>
              <p>{selectedTicket.originalQuery}</p>
            </div>

            <div className="detail-section">
              <h4>AI Response</h4>
              <p>{selectedTicket.aiResponse}</p>
            </div>

            <div className="detail-section">
              <h4>Escalation Reason</h4>
              <p>{selectedTicket.escalationReason}</p>
            </div>

            {selectedTicket.status === 'pending' && (
              <div className="detail-section">
                <h4>Provide Resolution</h4>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Provide your response to resolve this ticket..."
                  rows="5"
                />
                <button
                  onClick={() => handleResolveTicket(selectedTicket.id)}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Resolving...' : 'Resolve Ticket'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="tickets-section">
        <h3>Pending Tickets ({pendingTickets.length})</h3>
        {pendingTickets.length === 0 ? (
          <p className="no-data">No pending tickets</p>
        ) : (
          <div className="tickets-list">
            {pendingTickets.map(ticket => (
              <div
                key={ticket.id}
                className="ticket-card"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="ticket-header">
                  <strong>Ticket #{ticket.id}</strong>
                  <span className={`priority ${ticket.priority}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
                <p className="query">{ticket.originalQuery}</p>
                <small>{new Date(ticket.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tickets-section">
        <h3>Resolved Tickets ({resolvedTickets.length})</h3>
        {resolvedTickets.length === 0 ? (
          <p className="no-data">No resolved tickets</p>
        ) : (
          <div className="tickets-list">
            {resolvedTickets.map(ticket => (
              <div key={ticket.id} className="ticket-card resolved">
                <div className="ticket-header">
                  <strong>Ticket #{ticket.id}</strong>
                  <span className="resolved-badge">✓ RESOLVED</span>
                </div>
                <p className="query">{ticket.originalQuery}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
