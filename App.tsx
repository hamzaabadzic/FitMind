import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { ChatSession, Message, Role } from './types';
import { sendMessageToGemini, startChatWithHistory } from './services/geminiService';
import { Plus, MessageSquare, Menu, X, Trash2, Dumbbell } from 'lucide-react';

const WELCOME_MESSAGE: Message = {
    id: 'welcome',
    role: Role.MODEL,
    text: "# Dobrodošli u FitMind! 💪\n\nJa sam vaš AI trener. Kako vam mogu pomoći danas?\n\n*   Kreirajte plan treninga\n*   Prilagodite ishranu\n*   Pronađete motivaciju",
    timestamp: new Date()
};

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile default closed

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fitmind_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects for messages
        const restoredSessions = parsed.map((s: any) => ({
            ...s,
            messages: s.messages.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
            }))
        }));
        setSessions(restoredSessions);
        if (restoredSessions.length > 0) {
            setCurrentSessionId(restoredSessions[0].id);
        } else {
            createNewSession();
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save to local storage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
        localStorage.setItem('fitmind_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Re-initialize Gemini chat when session changes
  useEffect(() => {
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession) {
        startChatWithHistory(currentSession.messages);
    }
  }, [currentSessionId]);

  const createNewSession = () => {
    const newSession: ChatSession = {
        id: Date.now().toString(),
        title: 'Novi razgovor',
        messages: [WELCOME_MESSAGE],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false); // Close sidebar on mobile on selection
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    
    // If we deleted the active one, switch to another or create new
    if (currentSessionId === id) {
        if (newSessions.length > 0) {
            setCurrentSessionId(newSessions[0].id);
        } else {
            // Need to create a new one but wait for state update cycle or just force it now
            // Simplest is to clear ID, then effect checks? No, let's just make a new one manually
             const newSession: ChatSession = {
                id: Date.now().toString(),
                title: 'Novi razgovor',
                messages: [WELCOME_MESSAGE],
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            setSessions([newSession]);
            setCurrentSessionId(newSession.id);
        }
    }
    localStorage.setItem('fitmind_sessions', JSON.stringify(newSessions));
  };

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: new Date()
    };

    setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            // If it's the first real message (after welcome), update title
            let newTitle = session.title;
            if (session.messages.length === 1 && session.messages[0].id === 'welcome') {
                newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
            }
            return {
                ...session,
                title: newTitle,
                messages: [...session.messages, userMsg],
                updatedAt: Date.now()
            };
        }
        return session;
    }));

    setIsLoading(true);

    try {
      // Get current history for context (excluding the message we just added visually, 
      // but service needs to know full history? No, service usually appends.
      // However, since we might have switched sessions, `startChatWithHistory` logic in service 
      // handles the context. We just send the prompt.)
      
      const currentSession = sessions.find(s => s.id === currentSessionId);
      const currentHistory = currentSession ? currentSession.messages : [];

      const responseText = await sendMessageToGemini(text, currentHistory);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: responseText,
        timestamp: new Date()
      };

      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            return {
                ...session,
                messages: [...session.messages, aiMsg],
                updatedAt: Date.now()
            };
        }
        return session;
      }));

    } catch (error) {
       const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: "⚠️ Došlo je do greške. Provjerite internet konekciju i pokušajte ponovo.",
        timestamp: new Date(),
        isError: true
      };
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            return { ...session, messages: [...session.messages, errorMsg] };
        }
        return session;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentMessages = () => {
      const session = sessions.find(s => s.id === currentSessionId);
      return session ? session.messages : [];
  };

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-sans">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30
        h-full w-72 bg-zinc-950 border-r border-zinc-800
        flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
                <div className="bg-emerald-600 p-1.5 rounded-lg">
                    <Dumbbell className="w-5 h-5" />
                </div>
                FitMind
            </div>
            <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-zinc-400 hover:text-white"
            >
                <X size={24} />
            </button>
        </div>

        <div className="px-3 mb-2">
            <button 
                onClick={createNewSession}
                className="w-full flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl transition-all border border-zinc-700/50 group"
            >
                <Plus size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Novi Chat</span>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            <div className="text-xs font-semibold text-zinc-500 px-2 mb-2 uppercase tracking-wider">
                Historija
            </div>
            {sessions.map(session => (
                <div 
                    key={session.id}
                    onClick={() => {
                        setCurrentSessionId(session.id);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`
                        group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                        ${currentSessionId === session.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}
                    `}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare size={16} className={currentSessionId === session.id ? 'text-emerald-500' : 'text-zinc-600'} />
                        <span className="text-sm truncate max-w-[150px]">{session.title}</span>
                    </div>
                    
                    <button
                        onClick={(e) => deleteSession(e, session.id)}
                        className={`
                            p-1 hover:bg-red-900/30 hover:text-red-400 rounded transition-all opacity-0 group-hover:opacity-100
                            ${sessions.length === 1 ? 'hidden' : ''}
                        `}
                        title="Obriši"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500 text-center">
             v1.0.0 • FitMind AI
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full h-full bg-zinc-900">
        <ChatInterface 
            messages={getCurrentMessages()}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </main>
    </div>
  );
};

export default App;