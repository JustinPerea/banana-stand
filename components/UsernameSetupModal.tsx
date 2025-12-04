
import React, { useState, useEffect } from 'react';
import { isUsernameAvailable, setUsername } from '../services/profileService';

interface UsernameSetupModalProps {
  userId: string;
  currentUsername?: string | null;
  onComplete: (username: string) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const UsernameSetupModal: React.FC<UsernameSetupModalProps> = ({
  userId,
  currentUsername,
  onComplete,
  onCancel,
  isEditing = false
}) => {
  const [username, setUsernameInput] = useState(currentUsername || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setIsAvailable(null);
      return;
    }

    // Don't check if it's the current username
    if (currentUsername && username.toLowerCase() === currentUsername.toLowerCase()) {
      setIsAvailable(true);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsChecking(true);
      const available = await isUsernameAvailable(username);
      setIsAvailable(available);
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [username, currentUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await setUsername(userId, username);

    if (result.success) {
      onComplete(username);
    } else {
      setError(result.error || 'Failed to save username');
    }

    setIsSubmitting(false);
  };

  const isValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {isEditing ? 'Edit Username' : 'Choose Your Username'}
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
            {isEditing
              ? 'Update your display name for the community.'
              : 'This will be your display name when publishing recipes to the community.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''));
                  setError(null);
                }}
                placeholder="coolchef123"
                className={`w-full px-4 py-3 rounded-xl border-2 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none transition-colors ${
                  error
                    ? 'border-red-400 focus:border-red-500'
                    : isAvailable === true
                    ? 'border-green-400 focus:border-green-500'
                    : isAvailable === false
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-stone-200 dark:border-stone-700 focus:border-yellow-400'
                }`}
                maxLength={20}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking ? (
                  <div className="w-5 h-5 border-2 border-stone-300 border-t-yellow-400 rounded-full animate-spin" />
                ) : isAvailable === true && isValid ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : isAvailable === false ? (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-stone-400">
                Letters, numbers, and underscores only
              </p>
              <p className={`text-xs ${username.length > 20 ? 'text-red-500' : 'text-stone-400'}`}>
                {username.length}/20
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
            {isAvailable === false && !error && (
              <p className="text-sm text-red-500 mt-2">This username is already taken</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!isValid || isAvailable === false || isSubmitting || isChecking}
              className="flex-1 px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:bg-stone-200 dark:disabled:bg-stone-700 text-stone-900 disabled:text-stone-400 font-bold transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-400 border-t-stone-600 rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Username' : 'Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsernameSetupModal;
