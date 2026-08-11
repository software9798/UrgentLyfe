import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';
import { api } from '../api/client';
import { perfMonitor } from '../utils/performance';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  latencyMs?: number;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Namaste! I am UrgentLyfe AI Assistant. How can I help you with AC servicing, plumbing, short circuits, or booking an emergency 30-min technician today?',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    const endTimer = perfMonitor.startTimer('AI_CHAT', 'Gemini Chat Response', { queryLength: currentInput.length });

    try {
      const res = await api.chatWithAI(currentInput);
      const metric = endTimer({ status: 'SUCCESS' });
      setLastLatencyMs(metric.durationMs);

      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: metric.durationMs,
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      endTimer({ status: 'ERROR', error: err.message });
      const errorReply: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'I am experiencing a temporary connection hiccup. You can directly browse services or book an emergency 30-minute SOS technician above!',
        time: 'Just now',
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-amber-300 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>UrgentLyfe AI Assistant</span>
              {lastLatencyMs !== null && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5" />
                  {lastLatencyMs}ms
                </span>
              )}
            </h3>
            <p className="text-[10px] text-amber-400 font-medium">Powered by Gemini 3.6 Flash</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-1">
                AI
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
              }`}
            >
              <p>{m.text}</p>
              <span
                className={`text-[9px] block mt-1 ${
                  m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                }`}
              >
                {m.time}
              </span>
            </div>

            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] shrink-0 mt-1">
                Me
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 w-max">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Gemini AI thinking...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[10px]">
        {[
          'AC water leakage fix cost?',
          'What is 30-min SOS warranty?',
          'Plumbing tap repair price',
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => setInput(chip)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask in English or Hinglish..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
