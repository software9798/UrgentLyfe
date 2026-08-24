import React, { useEffect, useState } from 'react';
import { X, Code2, Server, Terminal, Copy, Check, FileJson } from 'lucide-react';

interface APIDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APIDocsModal: React.FC<APIDocsModalProps> = ({ isOpen, onClose }) => {
  const [docs, setDocs] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/docs')
        .then((res) => res.json())
        .then((data) => setDocs(data))
        .catch((err) => console.error('Docs fetch error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 text-slate-100 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 font-mono text-xs">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">UrgentLyfe Platform REST API Documentation</h2>
              <p className="text-[11px] text-slate-400">OpenAPI 3.0.0 Specification & Machine Learning Endpoints</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-amber-400">Environment Base URL</h3>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px]">
              https://ais-dev-pgv2abd46vtr7tmxkkfolt-438296894344.asia-southeast1.run.app/api
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Available API Routes</h3>
            <div className="space-y-2">
              {docs?.endpoints?.map((ep: any, i: number) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        ep.method.includes('POST')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-bold text-white text-xs">{ep.path}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{ep.summary}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw JSON Spec Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Raw OpenAPI Spec</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(docs, null, 2));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied Spec' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl overflow-x-auto text-[11px] text-amber-200/90 leading-relaxed max-h-64">
              {JSON.stringify(docs, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
