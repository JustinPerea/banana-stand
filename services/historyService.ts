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

/**
 * Compress an image to reduce storage size
 * Returns a smaller base64 JPEG
 */
const compressImage = (dataUrl: string, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if larger than maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Convert to JPEG for better compression
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl); // Fallback to original
      }
    };
    img.onerror = () => resolve(dataUrl); // Fallback to original
    img.src = dataUrl;
  });
};

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
   * Compresses the image to fit in localStorage
   */
  addToHistory: async (item: Omit<HistoryItem, 'id' | 'createdAt'>): Promise<HistoryItem[]> => {
    try {
      // Compress the image before storing
      const compressedImage = await compressImage(item.imageData);
      const compressedInput = item.inputPreview
        ? await compressImage(item.inputPreview, 200, 0.5)
        : undefined;

      const current = HistoryService.getHistory();

      const newItem: HistoryItem = {
        ...item,
        imageData: compressedImage,
        inputPreview: compressedInput,
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      // Add to beginning, keep only MAX items
      const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      console.log('History saved successfully, total items:', updated.length);
      return updated;
    } catch (e) {
      console.error('Failed to save to history:', e);
      // If storage is full, try clearing old items and retry
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, trimming history...');
        try {
          const current = HistoryService.getHistory();
          // Keep only 5 items and try again
          const trimmed = current.slice(0, 5);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
          return HistoryService.addToHistory(item);
        } catch (retryError) {
          console.error('Retry failed:', retryError);
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
