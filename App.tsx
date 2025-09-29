import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { Header } from './components/Header';
import { WelcomePanel } from './components/WelcomePanel';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SearchOverlay } from './components/SearchOverlay';
import { streamAztecExplanation } from './services/geminiService';
import { type SubTopic, type ChatMessage, type SkillLevel, type SearchResult, type Persona } from './types';
import { LEARNING_PATH } from './constants';

export default function App() {
  const [selectedTopic, setSelectedTopic] = useState<SubTopic | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('non-technical');
  const [persona, setPersona] = useState<Persona>('Empathetic Mentor');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [apiKey, setApiKey] = useState<string | null>(
    () => (typeof process !== 'undefined' && process.env?.API_KEY) || localStorage.getItem('gemini_api_key')
  );
  
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(!apiKey);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSelectTopic = useCallback((topic: SubTopic) => {
    setSelectedTopic(topic);
    setChatHistory([]);
    setIsLoading(true);
  }, []);
  
  const fetchInitialTopic = useCallback(async () => {
    if (!selectedTopic || !apiKey) return;
    
    setIsLoading(true);
    const initialModelMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', content: '' };
    setChatHistory([initialModelMessage]);

    try {
      const initialPrompt = `Explain the topic: "${selectedTopic.title}". Keep it concise and clear for a first-time introduction.`;
      const stream = await streamAztecExplanation(selectedTopic, [], initialPrompt, skillLevel, persona, apiKey);
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if(lastMessage) {
            lastMessage.content += chunkText;
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Error fetching initial topic:", error);
      const errorMessageText = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please check your API key or try again.';
      const errorMessage: ChatMessage = { id: `err-${Date.now()}`, role: 'model', content: errorMessageText };
      setChatHistory([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopic, skillLevel, apiKey, persona]);

  useEffect(() => {
    if (selectedTopic && apiKey) {
        fetchInitialTopic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, skillLevel, apiKey, persona]);

  const handleSendMessage = async (message: string) => {
    if (!selectedTopic || !apiKey) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: message };
    const modelPlaceholder: ChatMessage = { id: `model-${Date.now() + 1}`, role: 'model', content: '' };
    setChatHistory(prev => [...prev, userMessage, modelPlaceholder]);
    setIsLoading(true);

    try {
      const stream = await streamAztecExplanation(selectedTopic, chatHistory, message, skillLevel, persona, apiKey);
       for await (const chunk of stream) {
        const chunkText = chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if(lastMessage) {
              lastMessage.content += chunkText;
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
       const errorMessageText = error instanceof Error ? error.message : 'Sorry, something went wrong. Please check your API key or try again.';
       const errorMessage: ChatMessage = { id: `err-${Date.now()}`, role: 'model', content: errorMessageText };
      setChatHistory(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setIsApiModalOpen(false);
  }

  const handleFeedback = (messageId: string, feedback: 'good' | 'bad') => {
    setChatHistory(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const newFeedback = msg.feedback === feedback ? undefined : feedback;
          return { ...msg, feedback: newFeedback };
        }
        return msg;
      })
    );

    if (apiKey) {
      console.log(`[Analytics] Sending feedback for message ${messageId}: ${feedback}`);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const topic = LEARNING_PATH.flatMap(p => p.subTopics).find(t => t.id === result.topicId);
    if (topic) {
        handleSelectTopic(topic);
    }
    setIsSearchOpen(false);
  };

  const handleExplainCode = (code: string, language: string) => {
    const prompt = `Please provide a natural language explanation for this code snippet. My current skill level is "${skillLevel}".\n\n\`\`\`${language}\n${code}\n\`\`\``;
    handleSendMessage(prompt);
  };

  return (
    <div className="flex h-screen bg-gray-900 font-sans">
      <ApiKeyModal 
        isOpen={isApiModalOpen}
        onSave={handleSaveApiKey}
      />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />
      <Sidebar 
        learningPath={LEARNING_PATH} 
        onSelectTopic={handleSelectTopic}
        selectedTopicId={selectedTopic?.id}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex flex-col flex-1">
        <Header 
          skillLevel={skillLevel} 
          setSkillLevel={setSkillLevel}
          persona={persona}
          setPersona={setPersona}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onSettingsClick={() => setIsApiModalOpen(true)}
          onSearchClick={() => setIsSearchOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-800/50">
          {selectedTopic ? (
            <ChatPanel 
              topicTitle={selectedTopic.title}
              chatHistory={chatHistory} 
              isLoading={isLoading} 
              onSendMessage={handleSendMessage}
              onFeedback={handleFeedback}
              onExplainCode={handleExplainCode}
            />
          ) : (
            <WelcomePanel />
          )}
        </main>
      </div>
    </div>
  );
}