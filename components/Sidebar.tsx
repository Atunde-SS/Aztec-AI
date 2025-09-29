import React from 'react';
import { type LearningPath, type SubTopic } from '../types';
import { BeginnerIcon, IntermediateIcon, AdvancedIcon, ExpertIcon, ChevronDownIcon, CloseIcon } from './icons';

interface SidebarProps {
  learningPath: LearningPath[];
  onSelectTopic: (topic: SubTopic) => void;
  selectedTopicId?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const levelIcons: { [key: string]: React.ReactNode } = {
  'Beginner': <BeginnerIcon className="w-5 h-5" />,
  'Intermediate': <IntermediateIcon className="w-5 h-5" />,
  'Advanced': <AdvancedIcon className="w-5 h-5" />,
  'Expert': <ExpertIcon className="w-5 h-5" />,
};

const Section: React.FC<{title: string, level: string, children: React.ReactNode}> = ({ title, level, children }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  return (
    <div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-semibold text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
      >
        <div className="flex items-center gap-3">
          {levelIcons[level] || null}
          <span>{title}</span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && <div className="mt-2 pl-4 border-l-2 border-gray-700">{children}</div>}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ learningPath, onSelectTopic, selectedTopicId, isOpen, setIsOpen }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside className={`absolute md:relative flex-shrink-0 w-72 h-full bg-gray-900 border-r border-gray-700/50 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-white">Learning Path</h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 rounded-md hover:bg-gray-700 transition-colors md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500" 
            aria-label="Close menu"
          >
            <CloseIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto p-4 pr-2">
          {learningPath.map((section) => (
            <Section key={section.title} title={section.title} level={section.level}>
              <ul className="space-y-1">
                {section.subTopics.map((topic) => (
                  <li key={topic.id}>
                    <button
                      onClick={() => {
                        onSelectTopic(topic);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                        selectedTopicId === topic.id
                          ? 'bg-lime-500/10 text-lime-300 font-medium border-l-2 border-lime-400'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      {topic.title}
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          ))}
        </nav>
      </aside>
    </>
  );
};