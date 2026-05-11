import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { FiSend, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../styles/chat.css';

export const AIChat = ({ userId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.sendMessage(userId, input);

      // Add AI response
      const aiMessage = {
        type: 'ai',
        content: response.response,
        confidence: response.confidence,
        escalation: response.escalation,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show escalation message if needed
      if (response.shouldEscalate) {
        toast.success(`Escalated to support team. Ticket ID: ${response.escalation.ticketId}`);
      }
    } catch (error) {
      toast.error(error.message);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-chat ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <h3>Data Bundle Support</h3>
        <button onClick={onClose} className="close-btn">
          <FiX />
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h4>Hello! 👋</h4>
            <p>How can I help you with your data bundles today?</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <div className="message-content">{msg.content}</div>
            {msg.type === 'ai' && msg.confidence && (
              <small className="confidence">Confidence: {(msg.confidence * 100).toFixed(0)}%</small>
            )}
          </div>
        ))}

        {loading && (
          <div className="message ai">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
};
