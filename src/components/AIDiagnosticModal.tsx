import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Sparkles,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  IndianRupee,
  Loader2,
  Zap,
} from 'lucide-react';
import { AIDiagnosis } from '../types';
import { api } from '../api/client';

interface AIDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryHint?: string;
  onBookDiagnosis: (diagnosis: AIDiagnosis) => void;
}

export const AIDiagnosticModal: React.FC<AIDiagnosticModalProps> = ({
  isOpen,
  onClose,
  categoryHint = '',
  onBookDiagnosis,
}) => {
  const [problemText, setProblemText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosis | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunDiagnostic = async () => {
    if (!problemText.trim()) {
      setError('Please describe the issue or symptom in your home appliance/repair.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.diagnoseIssue({
        problemDescription: problemText,
        imageBase64: imagePreview || undefined,
        categoryHint,
      });

      setDiagnosis(result);
    } catch (err: any) {
      console.error('Diagnostic failed:', err);
      setError(err.message || 'AI Diagnosis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white animate-pulse';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Google Gemini 3.6 Flash
              </span>
              <h2 className="text-xl font-black">AI Repair Doctor & Diagnostic Wizard</h2>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Describe symptoms or upload a photo of the leaking AC, tripping MCB, or broken pipe to get an instant AI root-cause report & cost estimate.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {!diagnosis ? (
            /* Input Form */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Describe the Issue / Error Code / Noise / Leakage *
                </label>
                <textarea
                  id="ai-diagnostic-problem-input"
                  rows={4}
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="E.g., Split AC in master bedroom is making clicking noise and dropping water on wall. Cooling stopped 2 hours ago."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Photo Upload Option */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Upload Photo of Appliance / Issue (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Issue Preview"
                        className="h-16 w-16 object-cover rounded-lg border border-slate-300"
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">Photo Attached!</p>
                        <p className="text-[10px] text-slate-500">Gemini vision will analyze visual defects</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-500">
                      <Upload className="w-6 h-6 text-indigo-600" />
                      <span className="text-xs font-semibold text-slate-700">Click to upload photo</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 10MB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sample Preset Prompts */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Or pick a common home issue:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'AC water leaking indoor unit',
                    'Main MCB switch tripping repeatedly',
                    'Basin pipe burst & tap leaking',
                    'RO purifier making loud buzzing noise',
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setProblemText(preset)}
                      className="text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="run-ai-diagnostic-submit-btn"
                onClick={handleRunDiagnostic}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Gemini AI Engine Analyzing Defect...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Gemini AI Diagnostic Report</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Diagnostic Output View */
            <div className="space-y-6">
              {/* Top Summary Banner */}
              <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${getSeverityBadge(
                      diagnosis.severity
                    )}`}
                  >
                    SEVERITY: {diagnosis.severity}
                  </span>
                  <span className="text-[11px] text-slate-400">Est. Time: {diagnosis.estimatedDurationMinutes} Mins</span>
                </div>

                <h3 className="text-lg font-black text-amber-300">{diagnosis.issueSummary}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{diagnosis.explanation}</p>
              </div>

              {/* Root Cause */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <span>Identified Root Cause</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">{diagnosis.rootCause}</p>
              </div>

              {/* Safety Precautions */}
              {diagnosis.safetyPrecautions?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-red-900 mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Safety Precautions Before Technician Arrival</span>
                  </h4>
                  <ul className="space-y-1">
                    {diagnosis.safetyPrecautions.map((sec, i) => (
                      <li key={i} className="text-xs text-red-800 flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span>{sec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Parts */}
              {diagnosis.recommendedParts?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Recommended Spare Parts
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {diagnosis.recommendedParts.map((part, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Estimated Pricing Breakdown */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Cost Estimate Breakdown</h4>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Technician Labor Charge</span>
                  <span className="font-semibold text-slate-900">₹{diagnosis.estimatedLaborCost}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Estimated Hardware / Spare Parts</span>
                  <span className="font-semibold text-slate-900">₹{diagnosis.estimatedPartsCost}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-indigo-600 font-black">₹{diagnosis.estimatedTotalCost}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDiagnosis(null)}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Re-analyze
                </button>

                <button
                  id="book-ai-diagnosis-cta-btn"
                  onClick={() => {
                    onBookDiagnosis(diagnosis);
                    onClose();
                  }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Book Technician For This AI Fix</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
