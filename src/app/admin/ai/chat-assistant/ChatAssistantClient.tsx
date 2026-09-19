'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Loader2, Bot, User, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  role: string;
  content: string;
  queryType?: string | null;
  createdAt: Date | string;
}

interface Session {
  id: string;
  sessionId: string;
  title: string;
  createdAt: Date | string;
}

const EXAMPLE_QUERIES = [
  'How many purchase invoices do we have?',
  'Show today\'s new leads',
  'Which invoices are unpaid?',
  'Show pending quotations',
  'How many leads came in this week?',
  'Show AMC contracts expiring this month',
  'Are there any missing TRN suppliers?',
  'Show AI suggestions',
  'What is our total VAT payable?',
  'Tax summary',
];

// Minimal markdown renderer: bold (**text**) and line-by-line bullet (• or *)
function renderMarkdown(text: string): React.ReactNode[] {
  return text.split('\n').map((line, li) => {
    // Convert **text** to <strong>
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pi}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return (
      <span key={li}>
        {parts}
        {li < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

export default function ChatAssistantClient({ userRole }: { userRole: string }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Bug fix: case-insensitive role check — stored role may be 'Tax Manager' not 'TaxManager'
  const isTaxRole = ['superadmin', 'admin', 'accountant', 'tax manager', 'taxmanager'].includes(
    userRole.toLowerCase()
  );

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/admin/ai/chat');
      const data = await res.json();
      setSessions(data.sessions || []);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    const res = await fetch(`/api/admin/ai/chat?sessionId=${sessionId}`);
    const data = await res.json();
    // Bug fix: API returns { session: { messages: [...] } }, not { messages: [...] }
    setMessages(data.session?.messages || []);
  };

  const newSession = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const send = async (overrideText?: string) => {
    const text = overrideText ?? input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: activeSessionId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${data.error || 'Request failed'}`,
          createdAt: new Date(),
        }]);
        return;
      }

      if (data.sessionId && !activeSessionId) {
        setActiveSessionId(data.sessionId);
        await loadSessions();
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'Sorry, I could not process that request.',
        queryType: data.queryType,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev.filter(m => m.id !== userMsg.id), userMsg, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Network error. Please try again.',
        createdAt: new Date(),
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[500px]">
      {/* Session sidebar */}
      <div className="w-56 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={newSession}
            className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-2 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingSessions ? (
            <div className="text-center py-4 text-gray-400 text-xs">Loading…</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-xs">No sessions yet</div>
          ) : sessions.map(s => (
            <button
              key={s.id}
              onClick={() => loadSession(s.sessionId)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm truncate transition-colors ${
                activeSessionId === s.sessionId
                  ? 'bg-indigo-100 text-indigo-800 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s.title || 'Untitled Chat'}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-3 bg-white flex items-center gap-2 shrink-0">
          <Bot className="w-5 h-5 text-indigo-600" />
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Al Ghawas AI Copilot</h1>
            <p className="text-xs text-gray-400">
              Ask about invoices, leads, quotes, services{isTaxRole ? ', VAT & tax' : ''}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <Bot className="w-12 h-12 text-indigo-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm font-semibold">AI Admin Copilot</p>
                <p className="text-gray-400 text-xs mt-1">Ask a question about your CRM data</p>
              </div>
              <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto">
                {EXAMPLE_QUERIES
                  .filter(q => isTaxRole || !['What is our total VAT payable?', 'Tax summary', 'Are there any missing TRN suppliers?'].includes(q))
                  .slice(0, 8)
                  .map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="text-left text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-2 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      {q}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-200'
              }`}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-white" />
                  : <Bot className="w-4 h-4 text-gray-600" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm whitespace-pre-wrap'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
              }`}>
                {msg.role === 'assistant'
                  ? renderMarkdown(msg.content)
                  : msg.content}
                {msg.queryType && msg.queryType !== 'unknown' && msg.role !== 'user' && (
                  <div className="text-[10px] text-gray-400 mt-1.5 border-t border-gray-100 pt-1">
                    Query: {msg.queryType.replace(/_/g, ' ')}
                  </div>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-200">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span className="text-xs text-gray-500">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-gray-200 p-3 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about invoices, leads, quotes, services…"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            All queries are logged for audit. AI responses are informational only.
          </p>
        </div>
      </div>
    </div>
  );
}
