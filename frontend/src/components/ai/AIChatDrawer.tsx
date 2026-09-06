import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Globe,
  HeartHandshake,
  HelpCircle,
  Clock,
  RotateCcw,
  Camera,
  Paperclip,
  Star,
  PhoneCall,
  Tag,
  Trash2,
  Radio,
} from 'lucide-react';
import { api } from '../../api/client';
import { perfMonitor } from '../../utils/performance';

interface Recommendation {
  serviceId: string;
  serviceTitle: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  estimatedDuration?: string;
  whyThisService?: string;
  isUrgentRecommended?: boolean;
  tags?: string[];
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  image?: string;
  latencyMs?: number;
  detectedEmotion?: string;
  emotionEmoji?: string;
  empathyNote?: string;
  detectedLanguage?: string;
  issueDetected?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_SOS';
  immediateSafetyTip?: string;
  whyThisHappened?: string;
  resolutionPlan?: string;
  suggestedFollowUps?: string[];
  sentiment?: {
    polarity: 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE';
    score: number;
    intent: string;
    toneApplied: string;
    urgencyLevel: 'CRITICAL_SOS' | 'HIGH' | 'MEDIUM' | 'LOW';
    explanation?: string;
  };
  tailoredReasoning?: string;
  recommendations?: Recommendation[];
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBookService?: (serviceId: string, isUrgent?: boolean) => void;
  onOpenVoiceAssistant?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'auto', label: '🌐 Auto-Detect' },
  { code: 'Hinglish', label: '🇮🇳 Hinglish' },
  { code: 'Hindi', label: 'हिंदी (Hindi)' },
  { code: 'English', label: '🇬🇧 English' },
  { code: 'Bengali', label: 'বাংলা (Bengali)' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)' },
  { code: 'Telugu', label: 'తెలుగు (Telugu)' },
  { code: 'Marathi', label: 'मराठी (Marathi)' },
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  onBookService,
  onOpenVoiceAssistant,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Namaste! Main UrgentLyfe ka official AI Assistant hu 🤖\nAap kisi bhi bhasha (Hindi, English, Hinglish, Bengali, Tamil, etc.) me baat kar sakte hain.\n\nHum provide karte hain:\n• 💧 Plumbing (leakage, tap repair) — Approx ₹199 se\n• ⚡ Electrical (wiring, fan/light) — Approx ₹149 se\n• ❄️ AC Service & Repair (foam jet, gas) — Approx ₹599 se\n• 🧹 Home Cleaning (deep scrubbing) — Approx ₹399 se\n• 🪳 Herbal Pest Control — Approx ₹799 se\n• 🎨 Wall Painting — Approx ₹1,499 se / ₹12/sq ft\n• 🔧 Appliance Repair (fridge, washing machine) — Approx ₹299 se\n• ✂️ Salon at Home — Approx ₹349 se\n• 🔨 Carpentry & Locks — Approx ₹249 se\n\n🛡️ 30-Day Happiness Guarantee (₹0 rework) & 30-min Emergency SOS available!\nAap photo bhi upload kar sakte hain.',
      time: 'Just now',
      detectedLanguage: 'Hinglish / Multi-lingual',
      detectedEmotion: 'Friendly & Ready',
      emotionEmoji: '🤝',
      suggestedFollowUps: [
        'Mera AC thanda nahi kar raha',
        'Ghar ki safai karwani hai jaldi',
        'Tap se paani tapak raha hai',
        'Offers & Coupons (FIRST50, FESTIVE20)',
        'Mera technician kahan pahucha?',
        'Human agent se baat karni hai',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [isListening, setIsListening] = useState(false);
  const [liveVoiceText, setLiveVoiceText] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const latestVoiceRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Voice speech synthesis cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  // Stop listening helper
  const stopVoiceInput = (sendImmediately = false) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);

    const captured = (latestVoiceRef.current || liveVoiceText || input).trim();
    if (sendImmediately && captured) {
      handleSend(captured);
    }
  };

  // Toggle Speech Recognition (Mic)
  const toggleVoiceInput = async () => {
    if (typeof window === 'undefined') return;

    if (isListening) {
      stopVoiceInput(true);
      return;
    }

    setVoiceError(null);
    setLiveVoiceText('');
    latestVoiceRef.current = '';

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceError(
        'Speech recognition is not directly supported in this browser. Please use quick prompts below or type your message.'
      );
      return;
    }

    // Proactively check/request microphone permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (micErr: any) {
        console.warn('Microphone permission check warning:', micErr);
        // Continue to SpeechRecognition attempt as browser might handle native prompt
      }
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Select language for speech recognition
      if (selectedLanguage === 'Hindi' || selectedLanguage === 'Hinglish' || selectedLanguage === 'auto') {
        recognition.lang = 'hi-IN';
      } else if (selectedLanguage === 'English') {
        recognition.lang = 'en-IN';
      } else if (selectedLanguage === 'Bengali') {
        recognition.lang = 'bn-IN';
      } else if (selectedLanguage === 'Tamil') {
        recognition.lang = 'ta-IN';
      } else if (selectedLanguage === 'Telugu') {
        recognition.lang = 'te-IN';
      } else if (selectedLanguage === 'Marathi') {
        recognition.lang = 'mr-IN';
      } else {
        recognition.lang = 'hi-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalText += item[0].transcript + ' ';
          } else {
            interimText += item[0].transcript;
          }
        }

        const combined = (finalText + interimText).trim();
        if (combined) {
          latestVoiceRef.current = combined;
          setLiveVoiceText(combined);
          setInput(combined);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        if (err.error === 'not-allowed') {
          setVoiceError('Microphone permission blocked. Please allow mic in browser URL bar.');
        } else if (err.error === 'no-speech') {
          // Keep listening or allow retry
        } else {
          setVoiceError(`Voice input error: ${err.error || 'Please speak closer to microphone'}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition', e);
      setIsListening(false);
      setVoiceError('Could not start microphone. Try clicking again or select a voice prompt below.');
    }
  };

  // Text-to-Speech Speak Message
  const handleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown/bullet points for cleaner speech
    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size should be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setAttachedImage({
        base64: base64Data,
        mimeType: file.type || 'image/jpeg',
        preview: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRateMessage = (msgId: string, rating: number) => {
    setUserRatings((prev) => ({ ...prev, [msgId]: rating }));
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText && !attachedImage) return;
    if (loading) return;

    const currentImage = attachedImage;
    setAttachedImage(null);

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText || (currentImage ? 'Uploaded inspection photo' : ''),
      image: currentImage?.preview,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Human escalation check
    const lower = queryText.toLowerCase();
    if (
      lower.includes('human') ||
      lower.includes('agent') ||
      lower.includes('customer care') ||
      lower.includes('phone number') ||
      lower.includes('helpline') ||
      lower.includes('call support')
    ) {
      setTimeout(() => {
        const agentReply: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: '👨‍💼 Hamare senior customer support executive se baat karne ke liye aap direct call kar sakte hain:\n\n📞 24x7 UrgentLyfe Support Helpline: 1800-894-368 (Toll-Free)\n📱 WhatsApp Priority Support: +91 98765 43210\n\nHamare executives average 45 seconds ke andar aapki call answer karte hain!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detectedEmotion: 'Attentive & Caring',
          emotionEmoji: '🎧',
          suggestedFollowUps: [
            'Mera AC thanda nahi kar raha',
            'Tap se paani tapak raha hai',
            'Offers & Coupons (FIRST50, FESTIVE20)',
          ],
        };
        setMessages((prev) => [...prev, agentReply]);
        setLoading(false);
      }, 400);
      return;
    }

    const endTimer = perfMonitor.startTimer('AI_CHAT', 'Multilingual Emotion AI Chat', {
      queryLength: queryText.length,
      language: selectedLanguage,
    });

    try {
      // Build conversation history for multi-turn context
      const historyContext = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await api.chatWithAI(
        queryText || 'Please inspect this photo of the issue and recommend solution',
        historyContext,
        selectedLanguage !== 'auto' ? selectedLanguage : undefined,
        currentImage?.base64,
        currentImage?.mimeType
      );

      const metric = endTimer({ status: 'SUCCESS' });
      setLastLatencyMs(metric.durationMs);

      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: metric.durationMs,
        detectedEmotion: res.detectedEmotion,
        emotionEmoji: res.emotionEmoji,
        empathyNote: res.empathyNote,
        detectedLanguage: res.detectedLanguage,
        issueDetected: res.issueDetected,
        severity: res.severity,
        immediateSafetyTip: res.immediateSafetyTip,
        whyThisHappened: res.whyThisHappened,
        resolutionPlan: res.resolutionPlan,
        suggestedFollowUps: res.suggestedFollowUps,
        sentiment: res.sentiment,
        tailoredReasoning: res.tailoredReasoning,
        recommendations: res.recommendations,
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      endTimer({ status: 'ERROR', error: err.message });
      const errorReply: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Aap bilkul chinta na karein! Network spike ki wajah se slight delay hua, par aapka issue hum register kar rahe hain. Neeche diye gaye options se direct booking karein.',
        time: 'Just now',
        detectedEmotion: 'Supportive & Ready',
        emotionEmoji: '🛡️',
        suggestedFollowUps: [
          '30-Min Emergency SOS Plumber',
          'Power Foam Jet AC Service',
          'MCB & Electrician Visit',
        ],
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: 'Namaste! Chat reset ho gayi hai. Kisi bhi bhasha me apna sawal poochein ya pareshani share karein.',
        time: 'Just now',
        detectedLanguage: 'Hinglish / Any Language',
        detectedEmotion: 'Fresh & Welcoming',
        emotionEmoji: '✨',
        suggestedFollowUps: [
          'AC cooling nahi kar raha',
          'Pani ki pipe phat gayi hai',
          'Bijli ka switch spark ho raha hai',
        ],
      },
    ]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 font-sans">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-white tracking-tight">UrgentLyfe AI Master</h3>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Omni-Lingual • Empathy
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Understands all emotions, languages & technical details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/40 text-[10px] font-bold transition-colors cursor-pointer mr-1"
              title="Open Full 2-Way AI Voice Assistant"
            >
              <Radio className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>Voice Mode</span>
            </button>
          )}
          <button
            onClick={handleResetChat}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Language Bar Selector */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0 no-scrollbar">
        <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
          <Globe className="w-3 h-3 text-indigo-400" />
          <span>Language:</span>
        </span>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedLanguage(lang.code)}
            className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer font-bold text-[10px] ${
              selectedLanguage === lang.code
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Promotional & 24x7 Helpline Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-[10px] shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-black px-1.5 py-0.5 rounded-md shrink-0">
            <Tag className="w-2.5 h-2.5 text-amber-700" />
            FIRST50 (₹50 OFF)
          </span>
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 font-black px-1.5 py-0.5 rounded-md shrink-0">
            FESTIVE20 (20% OFF)
          </span>
        </div>

        <a
          href="tel:1800894368"
          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2 py-0.5 rounded-md shrink-0 transition-colors shadow-2xs text-[9.5px]"
          title="24x7 Toll Free Helpline"
        >
          <PhoneCall className="w-2.5 h-2.5" />
          <span>1800-894-368</span>
        </a>
      </div>

      {/* Messages Scrollable Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5 font-black shadow-xs">
                AI
              </div>
            )}

            <div
              className={`max-w-[92%] rounded-2xl p-3 text-xs leading-relaxed transition-all ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-blue-600/10'
                  : 'bg-white text-slate-800 border border-slate-200/90 shadow-sm rounded-bl-xs'
              }`}
            >
              {/* User-uploaded image preview in chat */}
              {m.image && (
                <div className="mb-2 rounded-xl overflow-hidden border border-white/30 max-w-[220px] shadow-sm">
                  <img
                    src={m.image}
                    alt="Uploaded damage / issue"
                    className="w-full h-auto object-cover max-h-48"
                  />
                </div>
              )}
              {/* Emotion & Language Badges for AI messages */}
              {m.sender === 'ai' && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
                  {m.detectedEmotion && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] font-bold">
                      <span>{m.emotionEmoji || '💡'}</span>
                      <span>Mood: {m.detectedEmotion}</span>
                    </span>
                  )}

                  {m.sentiment?.toneApplied && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-900 border border-purple-200/80 text-[9.5px] font-bold">
                      <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                      <span>Tone: {m.sentiment.toneApplied}</span>
                    </span>
                  )}

                  {m.detectedLanguage && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[9px] font-bold">
                      <Globe className="w-2.5 h-2.5" />
                      <span>{m.detectedLanguage}</span>
                    </span>
                  )}

                  {m.issueDetected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                      <Wrench className="w-2.5 h-2.5" />
                      <span>{m.issueDetected}</span>
                    </span>
                  )}

                  {/* Audio Speech Button */}
                  <button
                    onClick={() => handleSpeak(m.id, m.text)}
                    className="ml-auto p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={speakingMessageId === m.id ? 'Stop audio' : 'Listen to response'}
                  >
                    {speakingMessageId === m.id ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {/* Empathy Calibration Note */}
              {m.empathyNote && (
                <div className="mb-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50/90 to-purple-50/70 border border-amber-200/80 text-amber-950 text-[10.5px] leading-snug flex items-center gap-1.5 shadow-2xs">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{m.empathyNote}</span>
                </div>
              )}

              {/* Immediate Safety Alert Banner */}
              {m.immediateSafetyTip && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-[11px] leading-snug flex items-start gap-2 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-rose-950">Safety Precaution First:</span>
                    <span>{m.immediateSafetyTip}</span>
                  </div>
                </div>
              )}

              {/* Main Message Text */}
              <p className="whitespace-pre-line text-xs leading-relaxed font-normal">{m.text}</p>

              {/* Root Cause & Resolution Plan (if provided) */}
              {(m.whyThisHappened || m.resolutionPlan) && (
                <div className="mt-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5 text-[10px]">
                  {m.whyThisHappened && (
                    <div className="text-slate-700">
                      <span className="font-bold text-slate-900">🔍 Root Cause:</span>{' '}
                      {m.whyThisHappened}
                    </div>
                  )}
                  {m.resolutionPlan && (
                    <div className="text-slate-700">
                      <span className="font-bold text-slate-900">🛠️ Technician Action:</span>{' '}
                      {m.resolutionPlan}
                    </div>
                  )}
                </div>
              )}

              {/* Service Recommendations Cards */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                  <div className="text-[10px] font-black text-indigo-700 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Best Verified Service For You:</span>
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                      30-Day Warranty
                    </span>
                  </div>

                  {m.tailoredReasoning && (
                    <div className="text-[10px] text-indigo-950 bg-indigo-50/90 p-2 rounded-xl border border-indigo-200/80 font-medium flex items-start gap-1.5 leading-snug">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{m.tailoredReasoning}</span>
                    </div>
                  )}

                  {m.recommendations.map((rec) => (
                    <div
                      key={rec.serviceId}
                      className="bg-gradient-to-b from-blue-50/70 to-indigo-50/50 border border-blue-200/90 rounded-2xl p-3 space-y-2 shadow-xs transition-all hover:border-blue-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs leading-snug">
                            {rec.serviceTitle}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {rec.estimatedDuration && (
                              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {rec.estimatedDuration}
                              </span>
                            )}
                            {rec.tags && rec.tags.length > 0 && (
                              <span className="text-[9px] bg-white px-1.5 py-0.2 rounded text-indigo-700 font-bold border border-indigo-100">
                                {rec.tags[0]}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-extrabold text-blue-700 text-xs bg-white px-2 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                            ₹{rec.price}
                          </div>
                          {rec.originalPrice && rec.originalPrice > rec.price && (
                            <span className="text-[9px] text-slate-400 line-through block mt-0.5">
                              ₹{rec.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {rec.whyThisService && (
                        <p className="text-[10px] text-slate-700 bg-white/95 p-2 rounded-xl border border-slate-200/80 leading-snug">
                          💡 <span className="font-bold text-slate-800">Why this service:</span>{' '}
                          {rec.whyThisService}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            if (onBookService) onBookService(rec.serviceId, false);
                            onClose();
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-1.5 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs active:scale-[0.98]"
                        >
                          <span>Book Now (₹{rec.price})</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => {
                            if (onBookService) onBookService(rec.serviceId, true);
                            onClose();
                          }}
                          className="bg-amber-400 hover:bg-amber-500 text-slate-950 py-1.5 px-2.5 rounded-xl font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all shrink-0 active:scale-[0.98] shadow-xs"
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

              {/* Dynamic Follow-up Suggestions Chips */}
              {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="text-[9px] text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                    <HelpCircle className="w-2.5 h-2.5 text-indigo-500" />
                    <span>Quick Follow-ups:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.suggestedFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-all active:scale-[0.97]"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Star Rating for AI Messages */}
              {m.sender === 'ai' && (
                <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-[9px] font-medium">Was this helpful?</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRateMessage(m.id, star)}
                        className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                        title={`Rate ${star} star`}
                      >
                        <Star
                          className={`w-3 h-3 ${
                            (userRatings[m.id] || 0) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {userRatings[m.id] && (
                    <span className="text-emerald-600 font-bold text-[9px]">
                      Thanks for rating!
                    </span>
                  )}
                </div>
              )}

              {/* Timestamp & Latency */}
              <div className="flex items-center justify-between text-[9px] mt-1.5 pt-0.5">
                <span className={m.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}>
                  {m.time}
                </span>
                {m.latencyMs && (
                  <span className="text-slate-400 font-mono text-[8px] flex items-center gap-0.5">
                    <Activity className="w-2 h-2 text-emerald-500" />
                    {m.latencyMs}ms
                  </span>
                )}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold shadow-xs">
                Me
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-2xl border border-slate-200 w-max shadow-sm animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 block text-[11px]">
                UrgentLyfe AI is analyzing emotion & diagnosing issue...
              </span>
              <span className="text-[10px] text-slate-500">
                Finding best certified services & 30-min SOS options
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form & Controls */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        {/* Attachment Preview Strip */}
        {attachedImage && (
          <div className="mb-2 p-1.5 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={attachedImage.preview}
                alt="Attachment"
                className="w-10 h-10 rounded-lg object-cover border border-slate-300 shadow-2xs"
              />
              <div className="text-[11px] text-slate-700">
                <span className="font-bold block text-slate-900">Photo attached</span>
                <span className="text-[9px] text-slate-500">AI will inspect image for leaks/faults</span>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remove photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Voice Error Banner */}
        {voiceError && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-1.5 text-[11px]">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              onClick={() => setVoiceError(null)}
              className="text-amber-700 hover:text-amber-950 font-bold text-xs p-0.5 ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Live Active Voice Recording Card */}
        {isListening && (
          <div className="mb-2 p-2.5 bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border-2 border-rose-300 rounded-2xl flex flex-col gap-2 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <span className="font-black text-rose-900 text-xs">
                  Listening... बोलिए, हम सुन रहे हैं
                </span>
              </div>

              {/* Soundwave animation */}
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-1 h-2.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-4 bg-rose-600 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:300ms]" />
                <span className="w-1 h-4.5 bg-rose-700 rounded-full animate-bounce [animation-delay:75ms]" />
              </div>
            </div>

            {/* Live Spoken Text Preview */}
            <div className="bg-white/90 border border-rose-200 rounded-xl px-3 py-1.5 min-h-[34px] text-xs font-semibold text-slate-800 flex items-center">
              {liveVoiceText ? (
                <span className="text-slate-900 font-bold">"{liveVoiceText}"</span>
              ) : (
                <span className="text-slate-400 italic text-[11px]">
                  Boliye (e.g. AC thanda nahi kar raha, plumber chahiye)...
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => stopVoiceInput(false)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => stopVoiceInput(true)}
                disabled={!liveVoiceText && !input.trim()}
                className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-black shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Bhejein (Send Spoken Message)</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Quick Spoken Voice Command Chips */}
        <div className="mb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[10px]">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <Mic className="w-3 h-3 text-indigo-500" />
            <span>Voice prompts:</span>
          </span>
          {[
            'Mera AC thanda nahi kar raha',
            'Tap se paani tapak raha hai',
            'Switchboard me spark ho raha hai',
            'Bathroom deep cleaning',
            'Washing machine technician',
            'Offers & coupons check karo',
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => handleSend(promptText)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 border border-slate-200 font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <span>{promptText}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Voice Mic Button */}
          <button
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 border ${
              isListening
                ? 'bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-500/40 ring-2 ring-rose-300 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={isListening ? 'Listening... Click to send or stop' : 'Click to Speak (Hindi, English, Hinglish)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Photo Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 border ${
              attachedImage
                ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Upload photo of fault / leak for diagnosis"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={attachedImage ? 'Add a message or click send...' : 'Type or click mic to speak (Hindi, Hinglish, English)...'}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-slate-400 font-medium"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !attachedImage)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md shadow-blue-600/20 active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400 px-1">
          <span>🎙️ Mic bol ke msg • 📷 Photo • Enter to send</span>
          <span className="font-semibold text-indigo-600">24x7 AI Assistance</span>
        </div>
      </div>
    </div>
  );
};

