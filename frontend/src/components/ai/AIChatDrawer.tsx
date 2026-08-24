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
  CheckCircle2,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../api/client';
import { perfMonitor } from '../../utils/performance';

interface Recommendation {
  serviceId: string;
  serviceTitle: string;
  price: number;
  estimatedDuration?: string;
  whyThisService?: string;
  isUrgentRecommended?: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  latencyMs?: number;
  issueDetected?: string;
  recommendations?: Recommendation[];
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBookService?: (serviceId: string, isUrgent?: boolean) => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose, onBookService }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Namaste! I am UrgentLyfe AI Assistant. Describe any issue with your AC, plumbing, short circuit, RO water purifier, or cleaning — I will diagnose it and recommend the exact right service for you!',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const endTimer = perfMonitor.startTimer('AI_CHAT', 'Gemini Chat Recommendation', { queryLength: queryText.length });

    try {
      const res = await api.chatWithAI(queryText);
      const metric = endTimer({ status: 'SUCCESS' });
      setLastLatencyMs(metric.durationMs);

      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: metric.durationMs,
        issueDetected: res.issueDetected,
        recommendations: res.recommendations,
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      endTimer({ status: 'ERROR', error: err.message });
      const errorReply: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'I had a quick network glitch! You can ask again or browse our verified services directly.',
        time: 'Just now',
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
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
            <p className="text-[10px] text-amber-400 font-medium">Smart Issue Diagnosis & Service Recommender</p>
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
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-1 font-bold">
                AI
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
              }`}
            >
              {m.issueDetected && (
                <div className="mb-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px]">
                  <Wrench className="w-3 h-3 text-indigo-600" />
                  <span>Issue: {m.issueDetected}</span>
                </div>
              )}

              <p className="whitespace-pre-line">{m.text}</p>

              {/* Service Recommendations Cards */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recommended Service for You:</span>
                  </div>

                  {m.recommendations.map((rec) => (
                    <div
                      key={rec.serviceId}
                      className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-3 space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{rec.serviceTitle}</h4>
                          {rec.estimatedDuration && (
                            <span className="text-[10px] text-slate-500 font-medium">⏱️ {rec.estimatedDuration}</span>
                          )}
                        </div>
                        <span className="font-extrabold text-indigo-700 text-xs bg-white px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                          ₹{rec.price}
                        </span>
                      </div>

                      {rec.whyThisService && (
                        <p className="text-[10px] text-slate-700 bg-white/90 p-2 rounded-lg border border-slate-200/80 leading-snug">
                          💡 <span className="font-semibold text-slate-800">Why this service:</span> {rec.whyThisService}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            if (onBookService) onBookService(rec.serviceId, false);
                            onClose();
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <span>Book Now (₹{rec.price})</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => {
                            if (onBookService) onBookService(rec.serviceId, true);
                            onClose();
                          }}
                          className="bg-amber-400 hover:bg-amber-500 text-slate-950 py-1.5 px-2 rounded-lg font-extrabold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors shrink-0"
                          title="Book 30-min Emergency Express Service"
                        >
                          <Zap className="w-3 h-3 fill-current text-slate-950" />
                          <span>30-Min SOS</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`text-[9px] block mt-1.5 ${
                  m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                }`}
              >
                {m.time}
              </span>
            </div>

            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] shrink-0 mt-1 font-bold">
                Me
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 w-max shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Analyzing problem & finding best service...</span>
          </div>
        )}
      </div>

      {/* Quick Problem Prompts */}
      <div className="p-2.5 bg-white border-t border-slate-100 space-y-1">
        <div className="text-[10px] text-slate-400 font-semibold px-1">Common issues:</div>
        <div className="flex gap-1.5 overflow-x-auto text-[10px] pb-1">
          {[
            'AC water leaking & not cooling',
            'Switchboard spark & MCB trip',
            'Bathroom tap leaking water',
            'RO filter change & taste bad',
            'Deep cleaning for home',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors font-medium"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about any issue or service (Hindi/English)..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
