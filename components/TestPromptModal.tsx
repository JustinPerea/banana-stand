
import React, { useState, useMemo } from 'react';
import { BananaApp } from '../types';

interface TestPromptModalProps {
  onClose: () => void;
}

const TestPromptModal: React.FC<TestPromptModalProps> = ({ onClose }) => {
  const [jsonContent, setJsonContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Parse JSON and generate test prompt
  const generatedPrompt = useMemo(() => {
    if (!jsonContent.trim()) return null;

    try {
      const app: BananaApp = JSON.parse(jsonContent);
      setError(null);

      // Build the test prompt
      let prompt = '';

      // Add system instruction if present
      if (app.system_instruction) {
        prompt += `[System Instruction]:\n${app.system_instruction}\n\n`;
      }

      // Process master prompt - replace {{placeholders}} with descriptive text
      let processedPrompt = app.master_prompt || '';

      if (app.inputs && app.inputs.length > 0) {
        app.inputs.forEach(input => {
          const placeholder = `{{${input.id}}}`;
          let replacement = '';

          if (input.type === 'image') {
            replacement = '[the uploaded image]';
          } else if (input.type === 'select' && input.options) {
            replacement = `[${input.options[0]}]`; // Use first option as example
          } else {
            replacement = `[${input.placeholder || input.label}]`;
          }

          processedPrompt = processedPrompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
        });
      }

      prompt += `[Prompt]:\n${processedPrompt}`;

      // Add model config notes
      prompt += `\n\n---\n[Settings for Gemini]:\n`;
      prompt += `- Aspect Ratio: ${app.model_config?.aspectRatio || '1:1'}\n`;
      prompt += `- Temperature: ${app.model_config?.temperature || 1.0}\n`;
      if (app.model_config?.thinking_mode) {
        prompt += `- Thinking Mode: Enabled\n`;
      }

      // Add input instructions
      if (app.inputs && app.inputs.length > 0) {
        const imageInputs = app.inputs.filter(i => i.type === 'image');
        if (imageInputs.length > 0) {
          prompt += `\n[Attach these images]:\n`;
          imageInputs.forEach(input => {
            prompt += `- ${input.label}${input.placeholder ? ` (${input.placeholder})` : ''}\n`;
          });
        }
      }

      return prompt;
    } catch (e) {
      setError('Invalid JSON. Please check the syntax.');
      return null;
    }
  }, [jsonContent]);

  const handleCopy = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenGemini = () => {
    window.open('https://gemini.google.com/', '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-4xl overflow-hidden border-0 sm:border border-stone-200 dark:border-stone-800 flex flex-col max-h-[95vh] sm:max-h-[90vh] transition-colors">

        {/* Header */}
        <div className="bg-stone-900 dark:bg-stone-950 p-4 sm:p-6 flex items-center justify-between shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>🧪</span> Test Recipe in Gemini
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 flex flex-col gap-4 overflow-hidden flex-1">
          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl text-sm text-yellow-800 dark:text-yellow-200 transition-colors">
            <strong>How to test your recipe:</strong>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Paste your BananaApp JSON below</li>
              <li>Copy the generated prompt</li>
              <li>Open Gemini and paste it with your test image(s)</li>
              <li>Use the generated images for your recipe's demo!</li>
            </ol>
          </div>

          {/* Two column layout on desktop */}
          <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
            {/* JSON Input */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                Recipe JSON
              </label>
              <textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                placeholder='Paste your BananaApp JSON here...'
                className="w-full flex-1 min-h-[150px] lg:min-h-0 p-3 sm:p-4 bg-stone-50 dark:bg-stone-950 dark:text-white border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-xs sm:text-sm resize-none transition-colors"
              />
            </div>

            {/* Generated Prompt */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-stone-700 dark:text-stone-300">
                  Generated Prompt
                </label>
                {generatedPrompt && (
                  <button
                    onClick={handleCopy}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                      copied
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                    }`}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                )}
              </div>
              <div className="w-full flex-1 min-h-[150px] lg:min-h-0 p-3 sm:p-4 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl overflow-auto">
                {error ? (
                  <p className="text-red-500 text-sm font-bold">{error}</p>
                ) : generatedPrompt ? (
                  <pre className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap font-mono">
                    {generatedPrompt}
                  </pre>
                ) : (
                  <p className="text-stone-400 dark:text-stone-500 text-sm italic">
                    Paste JSON on the left to generate a test prompt...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 shrink-0">
            <button
              onClick={handleOpenGemini}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Open Gemini
            </button>
            <button
              onClick={handleCopy}
              disabled={!generatedPrompt}
              className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:bg-stone-200 disabled:text-stone-400 text-stone-900 font-bold py-3 px-6 rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              {copied ? '✓ Copied to Clipboard!' : 'Copy Prompt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPromptModal;
