import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const aiService = {
  /**
   * Send message to AI support
   */
  async sendMessage(userId, message, context = {}) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/support/chat`, {
        userId,
        query: message,
        context,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  },

  /**
   * Get escalation status
   */
  async getEscalationStatus(ticketId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/support/escalation/${ticketId}`
      );
      return response.data.status;
    } catch (error) {
      throw new Error(`Failed to get escalation status: ${error.message}`);
    }
  },
};
