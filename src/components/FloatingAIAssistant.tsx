import React, { useState } from 'react';
import { Bot, Mic, MessageSquare, Sparkles, X, ChevronUp, ChevronDown, Zap } from 'lucide-react';

interface FloatingAIAssistantProps {
  onOpenAIChat?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenAIVoice?: () => void;
  onOpenAIDoctor?: () => void;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  onOpenAIChat,
  onOpenVoiceAssistant,
  onOpenAIVoice,
  onOpenAIDoctor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 font-sans animate-fadeIn">
      {/* Eye-catching Tooltip Hint (Visible before first click) */}
      {showTooltip && !isOpen && (
        <div className="bg-slate-900/95 text-white rounded-2xl p-2.5 shadow-2xl border border-blue-500/40 text-xs relative animate-bounce max-w-[240px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="absolute -top-1.5 -left-1.5 bg-slate-800 text-slate-300 hover:text-white p-0.5 rounded-full border border-slate-700"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-extrabold text-white text-[11px] leading-tight">
                AI Assistant & Voice Call 🤖
              </p>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Click to Chat, Speak or Rate Technician!
              </p>
            </div>
          </div>
          {/* Arrow pointing down right */}
          <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 border-r border-b border-blue-500/40 absolute -bottom-1 right-6" />
        </div>
      )}

      {/* Expanded Popup Menu Box */}
      {isOpen && (
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-4 shadow-2xl border border-blue-500/40 w-[290px] sm:w-[320px] transition-all animate-in fade-in zoom-in-95 origin-bottom-right">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/30">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-900"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs text-white tracking-tight">AI Assistant</h3>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    24x7 ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Choose an option below</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 space-y-2">
            {/* 1. AI Chatbot Button */}
            <button
              id="floating-ai-chat-btn"
              onClick={() => {
                if (onOpenAIChat) onOpenAIChat();
                setIsOpen(false);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold p-2.5 rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-between text-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-xs leading-none">AI Chatbot</p>
                  <p className="text-[10px] text-blue-100 font-normal">Hindi / Eng text query</p>
                </div>
              </div>
              <span className="bg-white/20 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg uppercase">
                CHAT
              </span>
            </button>

            {/* 2. AI Voice Assistant Button */}
            <button
              id="floating-ai-voice-btn"
              onClick={() => {
                const voiceFn = onOpenVoiceAssistant || onOpenAIVoice;
                if (voiceFn) voiceFn();
                setIsOpen(false);
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold p-2.5 rounded-2xl shadow-md shadow-indigo-600/20 flex items-center justify-between text-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                  <Mic className="w-4 h-4 text-slate-900 animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-xs leading-none">Voice Assistant & Call</p>
                  <p className="text-[10px] text-indigo-100 font-normal">Speak or Rate Provider</p>
                </div>
              </div>
              <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase">
                SPEAK 🎙️
              </span>
            </button>

            {/* Quick Starter Pills */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Quick Ask:
              </p>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => {
                    if (onOpenAIChat) onOpenAIChat();
                    setIsOpen(false);
                  }}
                  className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  "AC Cooling Issue"
                </button>
                <button
                  onClick={() => {
                    if (onOpenAIChat) onOpenAIChat();
                    setIsOpen(false);
                  }}
                  className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  "Plumbing Leak"
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Small Compact Floating Circular Button Trigger */}
      <button
        id="small-floating-ai-trigger-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="relative group bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 hover:from-blue-600 hover:to-indigo-600 text-white p-3 sm:p-3.5 rounded-full shadow-2xl border-2 border-blue-400/50 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-blue-500/20"
        title="Open AI Assistant & Voice Call"
      >
        {/* Pulsing Green Online Dot */}
        <span className="absolute top-0 right-0 flex h-3 w-3 -mt-1 -mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
        </span>

        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
          <Bot className="w-4 h-4 text-white" />
        </div>

        <span className="text-xs font-black text-white tracking-wide pr-1 flex items-center gap-1">
          <span>AI 🤖</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5 text-amber-400" />}
        </span>
      </button>
    </div>
  );
};

