import axios from 'axios';
import { db } from '../firebase-config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const bundleService = {
  /**
   * Get all available bundles
   */
  async getAllBundles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bundles`);
      return response.data.bundles;
    } catch (error) {
      throw new Error(`Failed to fetch bundles: ${error.message}`);
    }
  },

  /**
   * Create bundle (admin only)
   */
  async createBundle(adminId, bundleData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/bundles`, {
        adminId,
        bundleData,
      });
      return response.data.bundle;
    } catch (error) {
      throw new Error(`Failed to create bundle: ${error.message}`);
    }
  },

  /**
   * Update bundle (admin only)
   */
  async updateBundle(adminId, bundleId, updates) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/bundles/${bundleId}`,
        { adminId, updates }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update bundle: ${error.message}`);
    }
  },

  /**
   * Delete bundle (admin only)
   */
  async deleteBundle(adminId, bundleId) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/bundles/${bundleId}`,
        { data: { adminId } }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete bundle: ${error.message}`);
    }
  },

  /**
   * Purchase bundle
   */
  async purchaseBundle(userId, bundleId, phoneNumber, quantity = 1) {
    try {
      const purchase = {
        userId,
        bundleId,
        phoneNumber,
        quantity,
        purchaseType: 'one-time',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'purchases'), purchase);
      return { success: true, purchaseId: docRef.id };
    } catch (error) {
      throw new Error(`Failed to create purchase: ${error.message}`);
    }
  },

  /**
   * Subscribe to bundle
   */
  async subscribeToBundle(userId, bundleId, phoneNumber, frequency) {
    try {
      const subscription = {
        userId,
        bundleId,
        phoneNumber,
        frequency, // daily, weekly, monthly, yearly
        isActive: true,
        status: 'active',
        startDate: new Date().toISOString(),
        nextRenewalDate: this.calculateNextRenewalDate(frequency),
        renewalCount: 0,
      };

      const docRef = await addDoc(collection(db, 'subscriptions'), subscription);
      return { success: true, subscriptionId: docRef.id };
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  },

  /**
   * Get user purchases
   */
  async getUserPurchases(userId) {
    try {
      const q = query(collection(db, 'purchases'), where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const purchases = [];
      snapshot.forEach(doc => {
        purchases.push({ id: doc.id, ...doc.data() });
      });

      return purchases;
    } catch (error) {
      throw new Error(`Failed to fetch purchases: ${error.message}`);
    }
  },

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(userId) {
    try {
      const q = query(collection(db, 'subscriptions'), where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const subscriptions = [];
      snapshot.forEach(doc => {
        subscriptions.push({ id: doc.id, ...doc.data() });
      });

      return subscriptions;
    } catch (error) {
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }
  },

  /**
   * Calculate next renewal date
   */
  calculateNextRenewalDate(frequency) {
    const date = new Date();
    
    switch(frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }

    return date.toISOString().split('T')[0];
  },
};
