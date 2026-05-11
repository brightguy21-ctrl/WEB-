import { create } from 'zustand';
import { bundleService } from '../services/bundleService';

export const useBundleStore = create((set) => ({
  bundles: [],
  loading: false,
  error:   null,
  stats: {
    totalRevenue:        0,
    activeSubscriptions: 0,
    todaysSales:         0,
  },

  fetchBundles: async () => {
    set({ loading: true, error: null });
    try {
      const data = await bundleService.getAllBundles();
      set({ bundles: data || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  setStats: (stats) => set({ stats }),
}));
