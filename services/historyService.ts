// Local storage service for generated image history

export interface HistoryItem {
  id: string;
  appId: string;
  appName: string;
  appEmoji: string;
  imageData: string; // base64 data URL
  createdAt: string;
  inputPreview?: string; // Optional thumbnail of input image
}

const HISTORY_KEY = 'banana_stand_history_v1';
const MAX_HISTORY_ITEMS = 20;

export const HistoryService = {
  /**
   * Get all history items from localStorage
   */
  getHistory: (): HistoryItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load history', e);
      return [];
    }
  },

  /**
   * Add a new item to history (keeps max 20 items)
   */
  addToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem[] => {
    try {
      const current = HistoryService.getHistory();

      const newItem: HistoryItem = {
        ...item,
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      // Add to beginning, keep only MAX items
      const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save to history', e);
      // If storage is full, try clearing old items and retry
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        try {
          const current = HistoryService.getHistory();
          // Keep only 10 items and try again
          const trimmed = current.slice(0, 10);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
          return HistoryService.addToHistory(item);
        } catch {
          return [];
        }
      }
      return [];
    }
  },

  /**
   * Remove a specific item from history
   */
  removeFromHistory: (id: string): HistoryItem[] => {
    try {
      const current = HistoryService.getHistory();
      const updated = current.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to remove from history', e);
      return [];
    }
  },

  /**
   * Clear all history
   */
  clearHistory: (): void => {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  },

  /**
   * Get count of history items
   */
  getHistoryCount: (): number => {
    return HistoryService.getHistory().length;
  }
};
