import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2, Dumbbell, Menu } from 'lucide-react';
import { Message, Role, QUICK_ACTIONS } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onToggleSidebar: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage,
  onToggleSidebar
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendClick = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 relative">
      {/* Header */}
      <header className="bg-zinc-900/90 backdrop-blur-sm p-4 flex items-center justify-between border-b border-zinc-800 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors md:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="bg-emerald-600 p-2 rounded-lg hidden md:block">
              <Dumbbell className="text-white w-5 h-5" />
          </div>
          <div>
              <h1 className="font-bold text-white text-lg">FitMind AI</h1>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-50">
               <Dumbbell size={48} className="mb-4" />
               <p>Započnite novi razgovor...</p>
           </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] md:max-w-[75%] gap-3 ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === Role.USER ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                {msg.role === Role.USER ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div
                className={`p-4 rounded-2xl shadow-sm text-sm md:text-base ${
                  msg.role === Role.USER
                    ? 'bg-zinc-800 text-white rounded-tr-none'
                    : 'bg-transparent text-zinc-200 pl-0' // Minimalist look for AI
                } ${msg.isError ? 'border border-red-500 bg-red-900/10' : ''}`}
              >
                {msg.role === Role.MODEL ? (
                  <MarkdownRenderer content={msg.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
                
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start w-full">
             <div className="flex gap-3 max-w-[90%]">
               <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} />
               </div>
               <div className="p-4 pl-0">
                 <div className="flex items-center gap-2 text-zinc-400">
                    <Loader2 className="animate-spin text-emerald-500 w-4 h-4" />
                    <span className="text-sm">FitMind razmišlja...</span>
                 </div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area & Quick Actions */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto w-full">
            {/* Quick Actions (only show if no loading and recent context is short or user just started) */}
            {!isLoading && messages.length < 3 && (
                <div className="pb-3 flex gap-2 overflow-x-auto scrollbar-hide mb-2">
                {QUICK_ACTIONS.map((action, idx) => (
                    <button
                    key={idx}
                    onClick={() => onSendMessage(action.prompt)}
                    className="whitespace-nowrap px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-400 text-xs rounded-full transition-colors font-medium flex-shrink-0"
                    >
                    {action.label}
                    </button>
                ))}
                </div>
            )}

            <div className="flex items-end gap-2 bg-zinc-800 border border-zinc-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all shadow-lg">
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pitajte za plan treninga, ishranu ili savjet..."
                className="w-full bg-transparent text-white placeholder-zinc-500 text-sm md:text-base p-2 resize-none focus:outline-none max-h-32 min-h-[44px]"
                rows={1}
                style={{ minHeight: '44px' }}
            />
            <button
                onClick={handleSendClick}
                disabled={isLoading || !inputText.trim()}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors mb-0.5"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
            </div>
            <p className="text-center text-[10px] text-zinc-600 mt-2">
            FitMind može pogriješiti. Konsultujte se sa ljekarom prije započinjanja novog režima.
            </p>
        </div>
      </div>
    </div>
  );
};