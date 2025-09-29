import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { type ChatMessage } from '../types';
import { SendIcon, UserIcon, AztecAIIcon, LoadingIcon, ThumbsUpIcon, ThumbsDownIcon, CopyIcon, CheckIcon, SparklesIcon } from './icons';

interface ChatPanelProps {
  topicTitle: string;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onFeedback: (messageId: string, feedback: 'good' | 'bad') => void;
  onExplainCode: (code: string, language: string) => void;
}

const CodeBlock: React.FC<{
  code: string;
  language: string;
  isLoading: boolean;
  onExplainCode: (code: string, language: string) => void;
}> = ({ code, language, isLoading, onExplainCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lang = language.trim().toLowerCase() || 'text';

  return (
    <div className="bg-gray-950 rounded-lg my-4 relative group/code">
      <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-400 bg-gray-800/50 rounded-t-lg">
        <span>{lang}</span>
        <div className="flex items-center gap-4 opacity-0 group-hover/code:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => onExplainCode(code, lang)}
            disabled={isLoading}
            aria-label="Explain code"
            className="flex items-center gap-1.5 text-xs font-semibold hover:text-white transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Explain</span>
          </button>
          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className="flex items-center gap-1.5 text-xs font-semibold hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 text-lime-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={dracula}
        showLineNumbers
        wrapLines
        lineNumberStyle={{ color: '#999', fontSize: '0.75rem', paddingRight: '1rem' }}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0 0 0.5rem 0.5rem',
          backgroundColor: '#1a1b26'
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5rem'
          },
        }}
      >
        {String(code).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

const URLPreview: React.FC<{ url: string }> = ({ url }) => {
  const [preview, setPreview] = useState<{ title: string; description: string; images: string[]; domain: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPreview = async () => {
      if (!isValidHttpUrl(url)) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, { signal });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.status === 'success' && data.data.title) {
            const { title, description, image, url: finalUrl } = data.data;
            setPreview({
                title,
                description,
                images: image ? [image.url] : [],
                domain: new URL(finalUrl).hostname
            });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch URL preview:', error);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchPreview();
    
    return () => {
      controller.abort();
    };
  }, [url]);

  if (isLoading) {
    return (
      <div className="w-full h-28 bg-gray-700/50 rounded-lg animate-pulse"></div>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex border border-gray-600/80 rounded-lg overflow-hidden hover:bg-gray-700/60 transition-colors no-underline">
      <div className="p-4 flex-1 overflow-hidden">
        <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider truncate">{preview.domain}</div>
        <h4 className="font-bold text-white text-sm truncate mt-1">{preview.title}</h4>
        {preview.description && <p className="text-xs text-gray-300 mt-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{preview.description}</p>}
      </div>
      {preview.images && preview.images[0] && (
        <div className="flex-shrink-0 w-28 bg-cover bg-center" style={{ backgroundImage: `url(${preview.images[0]})` }} />
      )}
    </a>
  );
};


const ChatMessageContent: React.FC<{
  content: string;
  isLoading: boolean;
  onExplainCode: (code: string, language: string) => void;
}> = ({ content, isLoading, onExplainCode }) => {
    const { parsedContent, urls } = useMemo(() => {
        if (!content) return { parsedContent: [], urls: [] };
        
        const uniqueUrls = new Set<string>();

        const renderInlines = (text: string): React.ReactNode => {
            if (!text) return null;
        
            const regex = /(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(\*.*?\*)|(`.*?`)|(https?:\/\/[^\s.,;!?())<>{}\[\]]+)/g;
            
            const parts = text.split(regex).filter(Boolean);
        
            return parts.map((part, i) => {
                let match = part.match(/^\[(.*?)\]\((.*?)\)$/);
                if (match) {
                    const linkText = match[1];
                    const url = match[2];
                    if (url.startsWith('http')) {
                        uniqueUrls.add(url);
                    }
                    return (
                        <a href={url} key={i} target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">
                            {renderInlines(linkText)}
                        </a>
                    );
                }

                match = part.match(/^(https?:\/\/[^\s.,;!?())<>{}\[\]]+)$/);
                if (match) {
                    const url = match[0];
                    uniqueUrls.add(url);
                    return (
                        <a href={url} key={i} target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">
                            {url}
                        </a>
                    );
                }
        
                match = part.match(/^\*\*(.*?)\*\*$/s);
                if (match) {
                    return <strong key={i}>{renderInlines(match[1])}</strong>;
                }
        
                match = part.match(/^\*(.*?)\*$/s);
                if (match) {
                    return <em key={i}>{renderInlines(match[1])}</em>;
                }
        
                match = part.match(/^`(.*?)`$/s);
                if (match) {
                    return <code key={i} className="bg-gray-800 px-1.5 py-1 rounded text-sm text-red-300">{match[1]}</code>;
                }
        
                return part;
            });
        };

        const blocks = content.split(/(```[\s\S]*?```)/g);
        const parsedBlocks = blocks.map((block, index) => {
            if (block.startsWith('```') && block.endsWith('```')) {
                const codeBlock = block.slice(3, -3);
                const [language, ...codeLines] = codeBlock.split('\n');
                const code = codeLines.join('\n').trim();
                return <CodeBlock key={index} code={code} language={language.trim()} isLoading={isLoading} onExplainCode={onExplainCode} />;
            }

            const lines = block.split('\n');
            const elements = [];
            let listItems: React.ReactNode[] = [];

            const flushList = () => {
                if (listItems.length > 0) {
                    elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1 my-2">{listItems}</ul>);
                    listItems = [];
                }
            };

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('# ')) {
                    flushList();
                    elements.push(<h1 key={i} className="text-2xl font-bold my-3">{renderInlines(line.substring(2))}</h1>);
                } else if (line.startsWith('## ')) {
                    flushList();
                    elements.push(<h2 key={i} className="text-xl font-bold my-3">{renderInlines(line.substring(3))}</h2>);
                } else if (line.startsWith('### ')) {
                    flushList();
                    elements.push(<h3 key={i} className="text-lg font-bold my-2">{renderInlines(line.substring(4))}</h3>);
                } else if (line.startsWith('* ') || line.startsWith('- ')) {
                    listItems.push(<li key={i}>{renderInlines(line.substring(2))}</li>);
                } else if (line.trim() === '') {
                    flushList();
                     if (elements.length > 0 && i < lines.length -1 && lines[i+1].trim() !== '') {
                        elements.push(<br key={`br-${i}`} />);
                    }
                } else {
                    flushList();
                    elements.push(<p key={i} className="my-1">{renderInlines(line)}</p>);
                }
            }
            flushList();

            return <div key={index}>{elements}</div>;
        });

        return { parsedContent: parsedBlocks, urls: Array.from(uniqueUrls) };
    }, [content, isLoading, onExplainCode]);

    return (
        <div className="prose prose-invert prose-sm max-w-none">
            {parsedContent}
            {urls.length > 0 && (
                <div className="not-prose mt-4 space-y-3">
                    {urls.slice(0, 2).map(url => <URLPreview key={url} url={url} />)}
                </div>
            )}
        </div>
    );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ topicTitle, chatHistory, isLoading, onSendMessage, onFeedback, onExplainCode }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4 pr-2">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <AztecAIIcon className="w-8 h-8 flex-shrink-0 mt-1 text-lime-400" />}
            <div className="group">
              <div className={`p-4 rounded-xl max-w-2xl ${msg.role === 'model' ? 'bg-gray-700/60 text-gray-200' : 'bg-indigo-600 text-white'}`}>
                <ChatMessageContent content={msg.content} isLoading={isLoading} onExplainCode={onExplainCode} />
              </div>
              {msg.role === 'model' && msg.content && !isLoading && (
                 <div className="flex items-center justify-end gap-2 pt-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onFeedback(msg.id, 'good')} className={`p-1 rounded-full hover:bg-gray-600 ${msg.feedback === 'good' ? 'text-lime-400' : 'text-gray-400'}`}>
                        <ThumbsUpIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onFeedback(msg.id, 'bad')} className={`p-1 rounded-full hover:bg-gray-600 ${msg.feedback === 'bad' ? 'text-red-400' : 'text-gray-400'}`}>
                        <ThumbsDownIcon className="w-4 h-4" />
                    </button>
                </div>
              )}
            </div>
            {msg.role === 'user' && <UserIcon className="w-8 h-8 flex-shrink-0 mt-1 text-indigo-300" />}
          </div>
        ))}
        {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length -1].content === '' && (
          <div className="flex items-start gap-4">
            <AztecAIIcon className="w-8 h-8 flex-shrink-0 mt-1 text-lime-400" />
            <div className="p-4 rounded-xl bg-gray-700/60 flex items-center justify-center">
              <LoadingIcon className="w-6 h-6 animate-spin text-lime-300" />
            </div>
          </div>
        )}
         <div ref={chatEndRef} />
      </div>
      <div className="mt-auto pt-4">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a follow-up question about "${topicTitle}"...`}
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-shadow"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-lime-500 rounded-full text-gray-900 hover:bg-lime-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};