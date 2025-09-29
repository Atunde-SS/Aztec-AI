import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Enter Your Gemini API Key</h2>
        <p className="text-gray-400 mb-6">
          To interact with the AI tutor, please provide your Google Gemini API key. 
          Your key is stored securely in your browser and is never shared.
        </p>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
            API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="Enter your API key..."
          />
        </div>
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-lime-400 hover:text-lime-300 transition-colors mb-6 block"
        >
          Get your API key from Google AI Studio &rarr;
        </a>
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full py-2.5 bg-lime-500 text-gray-900 font-semibold rounded-md hover:bg-lime-400 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
        >
          Save and Start Learning
        </button>
      </div>
    </div>
  );
};