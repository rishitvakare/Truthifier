"use client";

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, UploadCloud, ChevronRight, Loader2, CheckCircle2, XCircle, FileText, BookOpen, Download, Mail, Zap, ArrowRight, Printer } from 'lucide-react';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [truthSource, setTruthSource] = useState("");
  const [email, setEmail] = useState("");

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

  const getRiskColor = (level?: string) => {
    if (level === 'HIGH') return 'text-red-500 border-red-500/20 bg-red-500/10';
    if (level === 'MEDIUM') return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
    return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
  };

  const handlePrint = () => {
    window.print(); // Triggers print dialog with PDF save option
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Navigation - Hidden on Print */}
      <nav className="max-w-6xl mx-auto py-8 px-6 flex justify-between items-center print:hidden">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2 text-white italic">
          <Zap className="text-emerald-500 fill-emerald-500" size={24} /> TRUTHIFIER
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pt-12 pb-32 px-6">
        {!results ? (
          <section className="max-w-3xl mx-auto space-y-8 print:hidden">
            <h1 className="text-5xl font-black text-white mb-8 tracking-tighter text-center italic underline underline-offset-8 decoration-emerald-500">
              Protocol Terminal.
            </h1>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 space-y-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-4 block">01 // TRUTH SOURCE (INSTITUTIONAL POLICY)</label>
                <textarea 
                  className="w-full bg-black border border-white/10 rounded-xl p-5 text-sm text-emerald-500 font-mono focus:border-emerald-500/50 outline-none h-40 transition-all placeholder:text-emerald-900/50"
                  placeholder="Paste policies here..."
                  value={truthSource}
                  onChange={(e) => setTruthSource(e.target.value)}
                />
              </div>
              <div className="bg-black border border-white/10 border-dashed rounded-2xl p-12 text-center group cursor-pointer">
                <input type="file" className="hidden" id="log-upload" onChange={handleUpload} accept=".json" />
                <label htmlFor="log-upload" className="cursor-pointer">
                  {loading ? <Loader2 className="animate-spin mx-auto text-emerald-500" size={32} /> : (
                    <div className="bg-emerald-600 hover:bg-emerald-500 text-black px-12 py-4 rounded-full font-black text-sm uppercase tracking-tighter inline-flex items-center gap-2 transition transform group-hover:scale-105 shadow-xl shadow-emerald-500/10">
                      Upload Datasets <ChevronRight size={16} />
                    </div>
                  )}
                </label>
              </div>
            </div>
          </section>
        ) : (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Report Header - Styled for PDF */}
            <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-8 print:border-emerald-500/20">
              <div>
                <div className="hidden print:flex items-center gap-2 text-emerald-500 font-black italic mb-4">
                  <Zap size={20} fill="currentColor" /> TRUTHIFIER AUDIT REPORT
                </div>
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase print:text-black">Audit Results</h2>
                <p className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest mt-2">
                  Integrity Score: {results.score}% // Violations: {results.issues} // Secure Protocol Active
                </p>
              </div>
              <div className="flex gap-4 print:hidden">
                <button 
                  onClick={handlePrint} 
                  className="bg-emerald-600 text-black px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition flex items-center gap-2"
                >
                  <Printer size={14} /> Download PDF
                </button>
                <button onClick={() => setResults(null)} className="text-[10px] font-bold uppercase text-slate-600 hover:text-white underline tracking-widest">Reset Protocol</button>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="space-y-6 mb-16 print:space-y-4">
              {results.detailedResults?.map((res: any, i: number) => (
                <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden print:bg-white print:border-slate-200 print:shadow-none">
                  <div className="px-6 py-3 bg-white/5 flex justify-between items-center border-b border-white/5 print:bg-slate-50 print:border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">LOG_SEGMENT_{res.id}</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getRiskColor(res.riskLevel)}`}>
                      {res.riskLevel || res.status}
                    </span>
                  </div>
                  
                  <div className="p-6 grid md:grid-cols-2 gap-8 items-center print:grid-cols-1">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">AI GENERATED OUTPUT (DEVIANT)</p>
                      <p className="text-sm text-slate-300 italic leading-relaxed print:text-slate-800">"{res.originalResponse}"</p>
                    </div>
                    
                    <div className="flex gap-4 items-start border-l border-white/5 pl-8 print:border-l-2 print:border-emerald-500 print:pl-4 print:mt-4">
                      <ArrowRight className="text-emerald-500 shrink-0 mt-1 print:hidden" size={16} />
                      <div>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest print:text-emerald-700">FORENSIC CORRECTION</p>
                        <p className="text-sm text-slate-400 leading-relaxed print:text-slate-600 italic">Reference Point: {res.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Print Footer */}
            <div className="hidden print:block border-t border-slate-200 pt-8 mt-12 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">Official Truthifier Protocol Report // Restricted Distribution</p>
            </div>

            {/* Lead Capture - Hidden on Print */}
            {results.score < 100 && (
              <div className="p-10 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 max-w-2xl mx-auto text-center print:hidden">
                <h4 className="text-white font-black text-2xl italic tracking-tighter mb-2 underline underline-offset-4 decoration-emerald-500">Mitigation Required</h4>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">System-wide factual drift detected. Submit your credentials for a detailed security audit.</p>
                <div className="flex gap-2 max-w-md mx-auto">
                  <input type="email" placeholder="security@enterprise.com" className="bg-black border border-emerald-500/20 rounded-xl px-5 py-3 text-sm flex-1 outline-none text-emerald-500 focus:border-emerald-500 transition" />
                  <button className="bg-emerald-600 hover:bg-emerald-500 text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-tighter transition">Secure Roadmap</button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}