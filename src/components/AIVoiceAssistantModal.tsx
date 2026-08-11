import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Globe,
  Star,
  CheckCircle2,
  Send,
  MessageSquare,
  Bot,
  User,
  Radio,
  Award,
  Activity,
} from 'lucide-react';
import { api } from '../api/client';
import { ServiceItem } from '../types';
import { perfMonitor } from '../utils/performance';

interface AIVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookService?: (serviceId: string) => void;
  bookingForVoiceFeedback?: {
    id: string;
    partnerId?: string;
    partnerName?: string;
    serviceTitle: string;
  } | null;
}

export const AIVoiceAssistantModal: React.FC<AIVoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onBookService,
  bookingForVoiceFeedback,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'hi-IN' | 'en-IN' | 'hinglish'>('hi-IN');
  const [transcriptInput, setTranscriptInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);

  // Response & Action State
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [feedbackResult, setFeedbackResult] = useState<any>(null);
  const [lastVoiceLatencyMs, setLastVoiceLatencyMs] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: bookingForVoiceFeedback
        ? `Namaste! Please speak your voice review for ${bookingForVoiceFeedback.partnerName || 'your technician'} regarding ${bookingForVoiceFeedback.serviceTitle}.`
        : 'Namaste! Main UrgentLyfe AI Voice Assistant hoon. Aap Hindi, English ya Hinglish mein bolkar AC service, plumber, ya electrician book kar sakte hain.',
    },
  ]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      initSpeechRecognition();
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, selectedLanguage]);

  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage === 'hinglish' ? 'hi-IN' : selectedLanguage;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscriptInput(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        setTranscriptInput('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    } else {
      alert('Speech recognition is not supported in this browser. You can type or use sample audio prompts below.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (voiceMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find a natural Hindi or Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN'));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendVoiceQuery = async (textToSend?: string) => {
    const query = textToSend || transcriptInput;
    if (!query.trim()) return;

    setLoading(true);
    setHistory((prev) => [...prev, { sender: 'user', text: query }]);
    setTranscriptInput('');

    const endTimer = perfMonitor.startTimer('AI_VOICE', 'Gemini Voice Processing', {
      language: selectedLanguage,
      feedbackMode: !!bookingForVoiceFeedback,
    });

    try {
      if (bookingForVoiceFeedback) {
        // Voice Feedback Mode
        const res = await api.sendVoiceFeedback({
          bookingId: bookingForVoiceFeedback.id,
          providerId: bookingForVoiceFeedback.partnerId,
          voiceFeedbackText: query,
        });

        const metric = endTimer({ status: 'SUCCESS' });
        setLastVoiceLatencyMs(metric.durationMs);

        setFeedbackResult(res);
        const replyText = `Dhanyawad! Sentiment analyzed as ${res.sentiment}. Assigned Rating: ${res.calculatedRating}★. ${bookingForVoiceFeedback.partnerName || 'Technician'} score updated!`;
        setHistory((prev) => [...prev, { sender: 'ai', text: replyText }]);
        speakText(replyText);
      } else {
        // Voice Query Assistant Mode
        const res = await api.sendVoiceQuery({
          transcript: query,
          language: selectedLanguage,
        });

        const metric = endTimer({ status: 'SUCCESS' });
        setLastVoiceLatencyMs(metric.durationMs);

        setAiResponse(res);
        const replyText = res.speechResponse || 'Aapka order process ho gaya hai.';
        setHistory((prev) => [...prev, { sender: 'ai', text: replyText }]);
        speakText(replyText);
      }
    } catch (err: any) {
      endTimer({ status: 'ERROR', error: err.message });
      const fallbackMsg = 'Aapka voice input receive ho gaya hai. AC service package ₹599 mein available hai.';
      setHistory((prev) => [...prev, { sender: 'ai', text: fallbackMsg }]);
      speakText(fallbackMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const SAMPLE_VOICE_PROMPTS = [
    'Mera AC thanda nahi kar raha hai, Foam Jet service book kar do',
    'Short circuit in bedroom light switch board urgently',
    'Water tap is leaking in kitchen plumber bhejo',
    'Check my booking status for tomorrow',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Glowing Voice Banner Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-800 p-6 md:p-8 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3 w-fit">
            <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            {bookingForVoiceFeedback ? 'AI Voice Feedback & Ranking' : 'Multilingual AI Voice Assistant'}
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {bookingForVoiceFeedback ? 'Record Voice Review' : 'UrgentLyfe Speech-to-Text AI'}
          </h2>
          <p className="text-indigo-100 text-xs mt-1 flex items-center gap-2">
            <span>Hindi • English • Hinglish • Instant Gemini Voice Intent Parsing</span>
            {lastVoiceLatencyMs !== null && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 font-bold">
                <Activity className="w-3 h-3 text-emerald-300" />
                {lastVoiceLatencyMs}ms
              </span>
            )}
          </p>

          {/* Language Selector & Mute Toggle */}
          <div className="flex items-center justify-between gap-2 mt-4 bg-black/20 p-2 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-200 ml-1" />
              {(['hi-IN', 'en-IN', 'hinglish'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase transition-all ${
                    selectedLanguage === lang ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {lang === 'hi-IN' ? 'हिंदी (Hindi)' : lang === 'en-IN' ? 'English' : 'Hinglish'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setVoiceMuted(!voiceMuted);
                if (!voiceMuted) stopSpeaking();
              }}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {voiceMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
              <span>{voiceMuted ? 'Muted' : 'Voice On'}</span>
            </button>
          </div>
        </div>

        {/* Conversation & Waveform Display */}
        <div className="p-6 overflow-y-auto grow space-y-4 bg-slate-50">
          
          {/* Animated Mic Waveform Status */}
          <div className="flex flex-col items-center justify-center py-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
            {isListening && (
              <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-blue-500/20 animate-ping" />
              </div>
            )}

            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-600/50 scale-110 ring-4 ring-rose-200'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:scale-105'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
            </button>

            <p className="text-xs font-extrabold text-slate-800 mt-3 relative z-10">
              {isListening ? 'Listening... Speak now' : 'Tap Microphone to Speak'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports: "AC thanda nahi kar raha hai", "Electrician urgently needed"
            </p>

            {/* Simulated Voice Equalizer Lines */}
            {isListening && (
              <div className="flex items-center gap-1 mt-3">
                <span className="w-1 h-6 bg-blue-600 rounded-full animate-bounce" />
                <span className="w-1 h-10 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-4 bg-purple-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="w-1 h-8 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]" />
              </div>
            )}
          </div>

          {/* Chat History Messages */}
          <div className="space-y-3">
            {history.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* AI Voice Action Recommendation Card */}
          {aiResponse && aiResponse.recommendedServiceId && (
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                  Gemini Voice Recommendation
                </span>
                <span className="text-xs font-extrabold">₹{aiResponse.estimatedPrice || 599}</span>
              </div>
              <h4 className="text-sm font-black">{aiResponse.recommendedServiceName}</h4>
              <p className="text-xs text-emerald-100">{aiResponse.speechResponse}</p>
              {onBookService && (
                <button
                  type="button"
                  onClick={() => {
                    onBookService(aiResponse.recommendedServiceId);
                    onClose();
                  }}
                  className="w-full py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  {aiResponse.actionText || 'Book Service Immediately'}
                </button>
              )}
            </div>
          )}

          {/* AI Voice Feedback Sentiment Card */}
          {feedbackResult && (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 border-l-4 border-l-emerald-500 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">NLP Sentiment Score</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                  {feedbackResult.sentiment} ({feedbackResult.calculatedRating}★)
                </span>
              </div>
              <p className="text-xs text-slate-600">{feedbackResult.summary}</p>
              {feedbackResult.keyHighlights && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {feedbackResult.keyHighlights.map((hl: string, i: number) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                      ✓ {hl}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sample Audio Quick Options */}
          <div className="pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Or Try Quick Voice Commands:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_VOICE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendVoiceQuery(prompt)}
                  className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={transcriptInput}
            onChange={(e) => setTranscriptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendVoiceQuery()}
            placeholder={
              bookingForVoiceFeedback
                ? 'Speak or type voice feedback for technician...'
                : 'Type or speak voice command in Hindi or English...'
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="button"
            onClick={() => handleSendVoiceQuery()}
            disabled={loading || !transcriptInput.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
