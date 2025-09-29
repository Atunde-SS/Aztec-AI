import React, { useState, useEffect } from 'react';
import { searchKnowledgeBase } from '../services/searchService';
import { type SearchResult } from '../types';
import { SearchIcon } from './icons';

// A custom hook to debounce a value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value (the latest value) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called every time useEffect is re-called.
    // This cancels the previous timer and starts a new one.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run if value or delay changes

  return debouncedValue;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      setResults(searchKnowledgeBase(debouncedQuery));
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);
  
  useEffect(() => {
    // Reset state when overlay is closed
    if (!isOpen) {
        setQuery('');
        setResults([]);
    }
  }, [isOpen])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 z-50 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="relative bg-gray-800/80 max-w-2xl w-full mx-auto mt-20 rounded-xl shadow-2xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the Aztec knowledge base..."
            autoFocus
            className="w-full pl-12 pr-4 py-4 bg-transparent border-b border-gray-600 rounded-t-xl text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500"
          />
        </div>
        
        {debouncedQuery.length > 2 && (
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {results.length > 0 ? (
              <ul className="space-y-2">
                {results.map((result, index) => (
                  <li key={index}>
                    <button 
                      onClick={() => onSelectResult(result)}
                      className="w-full text-left p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">{result.sectionTitle}</span>
                        <span className="text-xs text-gray-400 bg-lime-500/20 px-2 py-1 rounded-full">{result.topicTitle}</span>
                      </div>
                      <p className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: result.snippet }}></p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center p-8 text-gray-400">
                <p>No results found for "{debouncedQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};