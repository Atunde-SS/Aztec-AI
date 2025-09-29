import React, { useState, useRef, useEffect } from 'react';
import { type SkillLevel, type Persona } from '../types';
import { LogoIcon, MenuIcon, SettingsIcon, SearchIcon, PersonaIcon, CheckIcon } from './icons';

interface HeaderProps {
  skillLevel: SkillLevel;
  setSkillLevel: (level: SkillLevel) => void;
  persona: Persona;
  setPersona: (persona: Persona) => void;
  onMenuClick: () => void;
  onSettingsClick: () => void;
  onSearchClick: () => void;
}

const PERSONAS: {id: Persona, name: string, description: string}[] = [
    { id: 'Empathetic Mentor', name: 'Empathetic Mentor', description: 'A friendly, encouraging guide.' },
    { id: 'Socratic Questioner', name: 'Socratic Questioner', description: 'Asks questions to guide you.' },
    { id: 'Pragmatic Developer', name: 'Pragmatic Developer', description: 'Code-focused and direct.' },
    { id: 'Conceptual Explainer', name: 'Conceptual Explainer', description: 'Builds mental models with analogies.' },
];

const PersonaSelector: React.FC<{ persona: Persona; setPersona: (persona: Persona) => void; }> = ({ persona, setPersona }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    return (
        <div ref={wrapperRef} className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-full hover:bg-gray-700 transition-colors" 
              aria-label="Select Persona"
              aria-haspopup="true"
              aria-expanded={isOpen}
            >
                <PersonaIcon className="w-6 h-6 text-gray-400" />
            </button>
            
            {isOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 origin-top-right animate-fade-in-fast">
                    <div className="p-4 border-b border-gray-700">
                        <p className="font-semibold text-white">Select a Persona</p>
                        <p className="text-xs text-gray-400">Change the AI's teaching style.</p>
                    </div>
                    <div className="py-2">
                        {PERSONAS.map(p => (
                            <button
                                key={p.id}
                                role="menuitem"
                                onClick={() => { setPersona(p.id); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                                    persona === p.id ? 'bg-lime-500/10 text-lime-300' : 'text-gray-300 hover:bg-gray-700/50'
                                }`}
                            >
                                <div>
                                    <p className="font-semibold">{p.name}</p>
                                    <p className={`text-xs ${persona === p.id ? 'text-lime-400/80' : 'text-gray-400'}`}>{p.description}</p>
                                </div>
                                {persona === p.id && <CheckIcon className="w-5 h-5 text-lime-400 flex-shrink-0 ml-2" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ skillLevel, setSkillLevel, persona, setPersona, onMenuClick, onSettingsClick, onSearchClick }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 shadow-md z-10">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-md hover:bg-gray-700 transition-colors md:hidden">
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <LogoIcon className="w-8 h-8 text-lime-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Aztec AI Tutor</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onSearchClick} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Search">
          <SearchIcon className="w-6 h-6 text-gray-400" />
        </button>
        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-full">
          <button 
            onClick={() => setSkillLevel('non-technical')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${skillLevel === 'non-technical' ? 'bg-lime-500 text-gray-900 shadow-md' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Beginner
          </button>
          <button 
            onClick={() => setSkillLevel('technical')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${skillLevel === 'technical' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Developer
          </button>
        </div>
        <PersonaSelector persona={persona} setPersona={setPersona} />
        <button onClick={onSettingsClick} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Settings">
            <SettingsIcon className="w-6 h-6 text-gray-400" />
        </button>
      </div>
    </header>
  );
};