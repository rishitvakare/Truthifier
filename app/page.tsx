"use client";

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, UploadCloud, ChevronRight, Loader2, CheckCircle2, XCircle, FileText, BookOpen, Download } from 'lucide-react';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [truthSource, setTruthSource] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('truthSource', truthSource);

    try {
      const response = await fetch('/api/audit', { method: 'POST', body: formData });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      alert("Analysis failed.");
    } finally { setLoading(false); }
  };

  // Helper to determine badge color based on Risk Level
  const getRiskColor = (level?: string) => {
    if (level === 'HIGH') return 'bg-red-600 text-white';
    if (level === 'MEDIUM') return 'bg-orange-500 text-white';
    return 'bg-blue-600 text-white';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans px-6 pb-20">
      <nav className="max-w-6xl mx-auto py-6 flex justify-between items-center border-b border-slate-800">
        <div className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-blue-500" /> VerifyAI
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-20 text-center">
        <section className="mb-16">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Zero-Defect Enterprise AI.</h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Our mission is to eliminate AI hallucinations by verifying LLM outputs against your institutional "Truth Source".
          </p>
        </section>

        <div className="max-w-2xl mx-auto text-left space-y-6">
          <div>
            <label className="text-sm font-semibold mb-2 block text-blue-400 flex items-center gap-2">
              <BookOpen size={16} /> 1. Paste Truth Source (Policies/SOPs)
            </label>
            <textarea 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm focus:border-blue-500 outline-none h-32"
              placeholder="Paste your policies here..."
              value={truthSource}
              onChange={(e) => setTruthSource(e.target.value)}
            />
          </div>

          {!results ? (
            <div>
              <label className="text-sm font-semibold mb-2 block text-blue-400 flex items-center gap-2">
                <FileText size={16} /> 2. Upload AI Logs
              </label>
              <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center hover:border-blue-500/50 transition cursor-pointer">
                <input type="file" className="hidden" id="log-upload" onChange={handleUpload} accept=".json" />
                <label htmlFor="log-upload" className="cursor-pointer">
                  {loading ? <Loader2 className="animate-spin mx-auto text-blue-500" size={40} /> : (
                    <>
                      <UploadCloud className="mx-auto mb-4 text-slate-500" size={40} />
                      <div className="bg-blue-600 px-8 py-3 rounded-full font-bold inline-flex items-center gap-2">
                        Start Compliance Audit <ChevronRight size={18} />
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl animate-in fade-in zoom-in">
               <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Audit Score: <span className="text-blue-500">{results.score}%</span></h2>
                    <p className="text-slate-400 text-xs">Analysis complete based on institutional constraints.</p>
                  </div>
                  <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg text-xs">
                    <Download size={14} /> Export PDF Report
                  </button>
               </div>
               <div className="space-y-3">
                  {results.detailedResults?.map((res: any, i: number) => (
                    <div key={i} className={`p-4 rounded border flex justify-between items-center text-sm ${res.status === 'FLAGGED' ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                      <div className="flex items-center gap-3">
                        {res.status === 'FLAGGED' ? <AlertTriangle size={16} className="text-orange-500" /> : <CheckCircle2 size={16} className="text-green-500" />}
                        <span>{res.reason}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${getRiskColor(res.riskLevel)}`}>
                        {res.riskLevel || res.status}
                      </span>
                    </div>
                  ))}
               </div>
               <button onClick={() => setResults(null)} className="mt-6 text-slate-500 text-xs underline w-full text-center">New Audit</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}