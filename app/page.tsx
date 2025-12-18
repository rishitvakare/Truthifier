"use client";

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, UploadCloud, ChevronRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Audit failed');

      const data = await response.json();
      setResults(data);
    } catch (error) {
      alert("Error running audit. Ensure your file is a valid JSON array of objects with 'response' fields.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b border-slate-800">
        <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <ShieldCheck className="text-blue-500" /> VerifyAI
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition">
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto pt-20 pb-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 text-xs mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Now auditing GPT-4o & Claude 3.5 logs
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Your AI is lying to your <span className="text-blue-500">customers.</span>
        </h1>
        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
          15% of enterprise LLMs hallucinate factual errors that lead to legal disputes. 
          Upload your chat logs for a <span className="text-white font-semibold">Free Hallucination Audit.</span>
        </p>

        {/* Upload Box */}
        {!results && (
          <div className={`bg-slate-900 border-2 border-dashed rounded-2xl p-12 transition group cursor-pointer ${loading ? 'border-blue-500/50 pointer-events-none' : 'border-slate-700 hover:border-blue-500/50'}`}>
            <input type="file" className="hidden" id="log-upload" onChange={handleUpload} accept=".json" />
            <label htmlFor="log-upload" className="cursor-pointer">
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 mb-4 text-blue-500 animate-spin" />
                  <h3 className="text-xl font-semibold mb-2">Analyzing Truth Scores...</h3>
                  <p className="text-slate-500 text-sm">Cross-referencing logs with policy databases.</p>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-12 h-12 mx-auto mb-4 text-slate-500 group-hover:text-blue-500 transition" />
                  <h3 className="text-xl font-semibold mb-2">Drop your .json logs here</h3>
                  <p className="text-slate-500 text-sm mb-6">Max file size 10MB. We only analyze text-based interactions.</p>
                  <div className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 transition">
                    Start Free Audit <ChevronRight size={18} />
                  </div>
                </>
              )}
            </label>
          </div>
        )}

        {/* Results Dashboard */}
        {results && (
          <div className="mt-10 p-8 bg-slate-900 border border-slate-800 rounded-2xl animate-in fade-in zoom-in duration-500 text-left">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-3xl font-bold">Audit Score: <span className={results.score < 80 ? 'text-red-500' : 'text-green-500'}>{results.score}%</span></h2>
                <p className="text-slate-400 mt-1">Found {results.issues} risks across {results.totalLogs} interactions.</p>
              </div>
              <button 
                onClick={() => setResults(null)}
                className="text-slate-500 hover:text-white text-sm transition"
              >
                Reset Audit
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {results.detailedResults.map((res: any, i: number) => (
                <div key={i} className={`p-4 rounded-lg border ${res.status === 'FLAGGED' ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/30 border-slate-700'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {res.status === 'FLAGGED' ? <XCircle size={14} className="text-red-500" /> : <CheckCircle2 size={14} className="text-green-500" />}
                      Log Entry #{res.id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${res.status === 'FLAGGED' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {res.status}
                    </span>
                  </div>
                  <p className={`text-xs ${res.status === 'FLAGGED' ? 'text-red-400' : 'text-slate-400'}`}>{res.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <AlertTriangle className="text-amber-500 mb-4" />
            <h4 className="font-bold mb-2">Policy Drift</h4>
            <p className="text-sm text-slate-400">Detect when AI cites outdated 2023 terms instead of current 2025 SOPs.</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <ShieldCheck className="text-green-500 mb-4" />
            <h4 className="font-bold mb-2">Revenue Leak</h4>
            <p className="text-sm text-slate-400">Identify unauthorized discount promises or refund guarantees.</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="text-blue-500 mb-4 font-mono font-bold">{"{ }"}</div>
            <h4 className="font-bold mb-2">Fact Validation</h4>
            <p className="text-sm text-slate-400">Compare model output against your core product database in real-time.</p>
          </div>
        </div>
      </main>
    </div>
  );
}