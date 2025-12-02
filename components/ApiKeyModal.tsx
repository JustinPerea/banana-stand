
import React, { useState, useEffect } from 'react';
import { getStoredKey, setStoredKey, removeStoredKey } from '../services/geminiService';

interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const [key, setKey] = useState('');
  const [storedKey, setStoredKeyDisplay] = useState<string | null>(null);
  const [persistKey, setPersistKey] = useState(false);

  useEffect(() => {
    const existing = getStoredKey();
    setStoredKeyDisplay(existing);
    if (existing) setKey(existing);
    
    // Check if it was in local storage to set the checkbox correctly
    // We can check by peeking at localStorage directly just for UI state
    if (localStorage.getItem('banana_stand_gemini_key')) {
        setPersistKey(true);
    }
  }, []);

  const handleSave = () => {
    if (!key.trim()) return;
    setStoredKey(key.trim(), persistKey);
    setStoredKeyDisplay(key.trim());
    onClose();
  };

  const handleRemove = () => {
    removeStoredKey();
    setStoredKeyDisplay(null);
    setKey('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-hidden border-0 sm:border border-stone-200 dark:border-stone-800 transition-colors flex flex-col">

        {/* Header */}
        <div className="bg-stone-900 dark:bg-stone-950 p-4 sm:p-6 flex items-center justify-between shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>🔑</span> API Settings
            </h2>
            <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <div className="mb-6">
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Google Gemini API Key</label>
                <div className="relative">
                    <input 
                        type="password" 
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full p-4 bg-stone-50 dark:bg-stone-950 dark:text-white border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm transition-colors"
                    />
                    {storedKey && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-1 text-xs font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            SAVED
                        </div>
                    )}
                </div>
                
                <div className="mt-3 flex items-start gap-2">
                    <input 
                        type="checkbox" 
                        id="persistKey"
                        checked={persistKey}
                        onChange={(e) => setPersistKey(e.target.checked)}
                        className="mt-1 w-4 h-4 text-yellow-400 border-stone-300 rounded focus:ring-yellow-400"
                    />
                    <label htmlFor="persistKey" className="text-xs text-stone-600 dark:text-stone-400 leading-tight cursor-pointer select-none">
                        <strong>Remember this key on this device.</strong><br/>
                        <span className="text-stone-400 dark:text-stone-500">Uncheck for public computers (key clears when tab closes).</span>
                    </label>
                </div>
            </div>

            <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 rounded-xl text-xs text-stone-600 dark:text-stone-400 mb-6 space-y-4 transition-colors">
                <div>
                    <p className="font-bold mb-2 text-stone-900 dark:text-stone-200">How to get a key:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Google AI Studio</a>.</li>
                        <li>Click <strong>"Create API Key"</strong>.</li>
                        <li>Copy the key and paste it above.</li>
                    </ol>
                    <p className="mt-2 text-[10px] text-stone-400 dark:text-stone-500">The key is free to use for testing.</p>
                </div>

                <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                     <p className="font-bold mb-2 flex items-center gap-1 text-stone-900 dark:text-stone-200">
                        <span>🔒</span> How to secure your key:
                     </p>
                     <p className="mb-2">Prevent others from using your key by adding a <strong>Website Restriction</strong>:</p>
                     <ol className="list-decimal pl-4 space-y-1">
                        <li>In AI Studio, click on your key to edit it.</li>
                        <li>Under <strong>"API key restrictions"</strong>, select <strong>"Websites"</strong>.</li>
                        <li>Add this URL:</li>
                     </ol>
                     <div className="mt-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 p-2 rounded font-mono text-center select-all cursor-pointer hover:border-yellow-400 transition-colors"
                          onClick={(e) => {
                             navigator.clipboard.writeText(window.location.origin);
                             (e.target as HTMLElement).style.borderColor = '#FACC15';
                             setTimeout(() => (e.target as HTMLElement).style.borderColor = '', 200);
                          }}
                          title="Click to Copy"
                     >
                        {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}
                     </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 p-4 rounded-xl text-xs text-blue-800 dark:text-blue-200 mb-6 transition-colors">
                <strong>💡 Tip:</strong> If your key stops working, check if your domain restriction matches the current URL exactly.
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleSave}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-colors shadow-sm"
                >
                    {storedKey ? 'Update Key' : 'Save Key'}
                </button>
                
                {storedKey && (
                    <button 
                        onClick={handleRemove}
                        className="w-full py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        Remove Key
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
