import React from 'react';
import { LogoIcon } from './icons';

export const WelcomePanel: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
      <LogoIcon className="w-24 h-24 text-lime-500 mb-6" />
      <h2 className="text-3xl font-bold text-white mb-2">Welcome to the Aztec AI Tutor</h2>
      <p className="max-w-md">
        Your personal guide to the future of on-chain privacy.
        Select a topic from the sidebar to begin your learning journey.
      </p>
    </div>
  );
};