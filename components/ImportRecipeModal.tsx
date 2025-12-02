
import React, { useState } from 'react';
import { BananaApp } from '../types';

interface ImportRecipeModalProps {
  onClose: () => void;
  onImport: (app: BananaApp) => void;
}

const ImportRecipeModal: React.FC<ImportRecipeModalProps> = ({ onClose, onImport }) => {
  const [jsonContent, setJsonContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    setError(null);
    if (!jsonContent.trim()) {
      setError("Please paste the recipe JSON.");
      return;
    }

    try {
      const app = JSON.parse(jsonContent) as BananaApp;
      
      // Basic validation
      if (!app.name || !app.master_prompt) {
        setError("Invalid Recipe JSON. Missing 'name' or 'master_prompt'.");
        return;
      }

      // Ensure it has an ID (or generate one)
      if (!app.id) {
          app.id = crypto.randomUUID();
      } else {
         // Regenerate ID to avoid conflicts if importing own app, or just to be safe
         // But maybe we want to keep ID if moving between devices? 
         // The original logic regenerated it:
         app.id = crypto.randomUUID();
      }
      
      // Mark as imported in name if not present?
      // Original logic: app.name = `Imported: ${app.name}`;
      // Let's keep it but maybe cleaner
      if (!app.name.startsWith('Imported: ')) {
          app.name = `Imported: ${app.name}`;
      }

      onImport(app);
      onClose();
    } catch (e) {
      setError("Failed to parse JSON. Please check the syntax.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl overflow-hidden border-0 sm:border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] sm:max-h-[85vh] transition-colors">

        {/* Header */}
        <div className="bg-stone-900 dark:bg-stone-950 p-4 sm:p-6 flex items-center justify-between shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>📥</span> Import Recipe
            </h2>
            <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>

        <div className="p-4 sm:p-6 flex flex-col gap-4 overflow-hidden flex-1">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl text-sm text-yellow-800 dark:text-yellow-200 transition-colors">
                Paste the JSON code of a shared recipe below to add it to your collection.
            </div>

            <textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                placeholder='{ "id": "...", "name": "...", ... }'
                className="w-full flex-1 min-h-[200px] sm:min-h-[300px] p-3 sm:p-4 bg-stone-50 dark:bg-stone-950 dark:text-white border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-xs sm:text-sm resize-none transition-colors"
            />
            
            {error && (
                <div className="text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900">
                    ⚠️ {error}
                </div>
            )}

            <div className="flex gap-3 mt-auto pt-2">
                <button 
                    onClick={onClose}
                    className="flex-1 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleImport}
                    className="flex-1 py-3 bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold rounded-xl transition-colors shadow-lg"
                >
                    Import Recipe
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImportRecipeModal;

