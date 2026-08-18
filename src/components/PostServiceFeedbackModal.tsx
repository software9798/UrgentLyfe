import React, { useState } from 'react';
import {
  X,
  Star,
  Camera,
  Upload,
  Mic,
  Phone,
  PhoneOff,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Trash2,
  Image as ImageIcon,
  Volume2,
} from 'lucide-react';
import { Booking } from '../types';

interface PostServiceFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmitFeedback: (data: {
    bookingId: string;
    rating: number;
    reviewText: string;
    workPhotos: string[];
    voiceCallUsed?: boolean;
    voiceFeedbackText?: string;
  }) => void;
}

export const PostServiceFeedbackModal: React.FC<PostServiceFeedbackModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitFeedback,
}) => {
  if (!isOpen || !booking) return null;

  const partner = booking.partner;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [workPhotos, setWorkPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Simulated Voice Call State
  const [isIncomingCall, setIsIncomingCall] = useState<boolean>(false);
  const [isInVoiceCall, setIsInVoiceCall] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [voiceSpeechTranscript, setVoiceSpeechTranscript] = useState<string>('');
  const [aiCallMessage, setAiCallMessage] = useState<string>('');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);

  // Quick preset review tags
  const PRESET_TAGS = [
    '⚡ On-Time Arrival',
    '✨ Cleaned Up Afterward',
    '🛠️ Skilled & Professional',
    '💬 Friendly Communication',
    '💯 Transparent Pricing',
  ];

  // Quick sample work photos for easy testing
  const SAMPLE_WORK_PHOTOS = [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
  ];

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setWorkPhotos((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const handleAddSamplePhoto = (url: string) => {
    if (!workPhotos.includes(url)) {
      setWorkPhotos((prev) => [...prev, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setWorkPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleTag = (tag: string) => {
    if (reviewText.includes(tag)) {
      setReviewText(reviewText.replace(tag, '').trim());
    } else {
      setReviewText((prev) => (prev ? `${prev} • ${tag}` : tag));
    }
  };

  // Trigger Incoming AI Feedback Call Simulation
  const handleStartFeedbackCall = () => {
    setIsIncomingCall(true);
  };

  const handleAcceptCall = () => {
    setIsIncomingCall(false);
    setIsInVoiceCall(true);
    setCallDuration(0);

    const greeting = `Namaste ${booking.userName}! Main UrgentLyfe AI Assistant bol raha hoon. ${
      partner?.name || 'Technician'
    } ne aapke ${booking.service.title} ka kaam poora kar diya hai. Aapko unki service aur kaam kaisa laga?`;

    setAiCallMessage(greeting);

    // Speak AI Greeting via SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(greeting);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    // Call duration timer
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Auto-complete call scenario simulation
    setTimeout(() => {
      const sampleVoiceResp = "Technician boht achhe the, time pe aaye aur AC ki foam jet jet wash bilkul badhiya se clean ki. 5 star rating!";
      setVoiceSpeechTranscript(sampleVoiceResp);
      setReviewText((prev) => prev || sampleVoiceResp);
      setRating(5);
    }, 4000);

    return () => clearInterval(timer);
  };

  const handleEndCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsInVoiceCall(false);
    setIsIncomingCall(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    onSubmitFeedback({
      bookingId: booking.id,
      rating,
      reviewText: reviewText || 'Great service quality & prompt work completion!',
      workPhotos,
      voiceCallUsed: isInVoiceCall || !!voiceSpeechTranscript,
      voiceFeedbackText: voiceSpeechTranscript || undefined,
    });

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 relative">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
              Post-Service Feedback
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {booking.id}</span>
          </div>
          <h2 className="text-lg font-black text-white mt-1">Service Quality & Work Feedback</h2>
          <p className="text-xs text-slate-300">{booking.service.title}</p>
        </div>

        {/* SIMULATED INCOMING CALL OVERLAY */}
        {isIncomingCall && (
          <div className="bg-slate-950 text-white p-6 text-center space-y-6 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 mx-auto flex items-center justify-center shadow-2xl border-4 border-indigo-400">
              <Phone className="w-10 h-10 text-white animate-bounce" />
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Incoming AI Assistant Call</p>
              <h3 className="text-xl font-black text-white mt-1">UrgentLyfe AI Customer Care</h3>
              <p className="text-xs text-slate-400 mt-1">Feedback Call for Order {booking.id}</p>
            </div>

            <div className="flex justify-center gap-6 pt-4">
              <button
                onClick={handleEndCall}
                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={handleAcceptCall}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center justify-center animate-bounce"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE VOICE CALL SCREEN */}
        {isInVoiceCall && (
          <div className="bg-gradient-to-b from-indigo-950 to-slate-900 text-white p-6 text-center space-y-5">
            <div className="flex items-center justify-between text-xs text-indigo-300 border-b border-indigo-900/60 pb-3">
              <span className="flex items-center gap-1.5 font-bold">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> UrgentLyfe AI Feedback Call
              </span>
              <span className="font-mono bg-indigo-900 px-2 py-0.5 rounded text-amber-400">
                00:{callDuration < 10 ? `0${callDuration}` : callDuration}
              </span>
            </div>

            <div className="bg-indigo-900/40 p-4 rounded-2xl border border-indigo-800 text-left space-y-2">
              <p className="text-[10px] font-bold text-amber-400 uppercase">🤖 AI Assistant Speaking:</p>
              <p className="text-xs text-slate-200 leading-relaxed italic">"{aiCallMessage}"</p>
            </div>

            {voiceSpeechTranscript && (
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800 text-left space-y-1">
                <p className="text-[10px] font-bold text-emerald-400 uppercase">🗣️ Your Transcribed Reply:</p>
                <p className="text-xs text-emerald-200 font-medium">"{voiceSpeechTranscript}"</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-4">
              <button
                onClick={handleEndCall}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <PhoneOff className="w-4 h-4" /> End Call & Save Review
              </button>
            </div>
          </div>
        )}

        {/* MAIN FEEDBACK FORM */}
        {!isIncomingCall && !isInVoiceCall && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-lg font-black text-emerald-900">Thank You For Your Feedback!</h3>
                <p className="text-xs text-emerald-700">
                  Your rating & work completion photos have been recorded. Provider score updated!
                </p>
              </div>
            ) : (
              <>
                {/* Provider Profile Header */}
                {partner && (
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-600 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-black text-slate-900">{partner.name}</h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {partner.rating}★ Rating • {partner.badge || 'Verified Expert'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartFeedbackCall}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-[11px] px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>AI Call Me</span>
                    </button>
                  </div>
                )}

                {/* Star Rating Picker */}
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                    1. How would you rate the service? *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {rating === 5 && '🌟 Outstanding (5.0)'}
                      {rating === 4 && '👍 Very Good (4.0)'}
                      {rating === 3 && '😐 Average (3.0)'}
                      {rating === 2 && '👎 Below Expectation (2.0)'}
                      {rating === 1 && '❌ Poor Experience (1.0)'}
                    </span>
                  </div>
                </div>

                {/* Quick Feedback Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quick Highlights
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                          reviewText.includes(tag)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Written Review */}
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                    2. Write detailed feedback (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us how the technician worked, punctuality, hygiene and result..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                {/* Work Photo Upload Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-indigo-600" />
                      3. Attach Work Completion Photos ({workPhotos.length})
                    </label>
                    <span className="text-[10px] text-slate-500">Show provider's finished work</span>
                  </div>

                  {/* Photo Previews */}
                  {workPhotos.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {workPhotos.map((photo, index) => (
                        <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0 group">
                          <img src={photo} alt={`Work Photo ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* File Upload Input & Sample Photo Buttons */}
                  <div className="space-y-2">
                    <label className="p-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-bold text-slate-700">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      <span>Upload Work Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Quick Sample Photos for Testing */}
                    <div className="bg-indigo-50/60 p-2.5 rounded-2xl border border-indigo-100 text-[11px] space-y-1.5">
                      <p className="font-bold text-indigo-900 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                        Quick Test: Tap a sample work photo to attach:
                      </p>
                      <div className="flex gap-2">
                        {SAMPLE_WORK_PHOTOS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAddSamplePhoto(url)}
                            className="relative w-12 h-12 rounded-xl overflow-hidden border border-indigo-200 hover:border-indigo-600 cursor-pointer transition-transform hover:scale-105 shrink-0"
                          >
                            <img src={url} alt="Sample Work" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Submit Review & Photos
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
