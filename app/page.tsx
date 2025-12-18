"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, UploadCloud, ChevronRight, 
  Loader2, CheckCircle2, Zap, ArrowRight, Printer, 
  TrendingDown, DollarSign, Activity
} from 'lucide-react';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [truthSource, setTruthSource] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Audit Analysis Handler
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
      alert("Protocol Analysis Failed.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Database Wired Lead Submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !results) return;
  
    // REMOVED: B2B filter logic that blocked personal domains
  
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email, // Now accepts any valid email format
          auditScore: results.score,
          liability: results.issues * 120 * 12 
        }),
      });
  
      if (response.ok) {
        alert("Verification Secured. Roadmap access sent to " + email);
        setEmail("");
      } else {
        throw new Error();
      }
    } catch (error) {
      alert("Connection Error: Unable to reach lead database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto py-8 px-6 flex justify-between items-center print:hidden">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2 text-white italic">
          <Zap className="text-emerald-500 fill-emerald-500" size={24} /> TRUTHIFIER
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <a href="#mission" className="hover:text-emerald-500 transition border-b border-transparent hover:border-emerald-500 pb-1">Mission</a>
          <a href="#terminal" className="hover:text-emerald-500 transition border-b border-transparent hover:border-emerald-500 pb-1">Terminal</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pt-12 pb-32 px-6">
        {/* REVENUE PROTECTION HOOK */}
        {!results && (
          <section id="mission" className="mb-24 text-center animate-in fade-in duration-1000">
            <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              Institutional Shield v1.0
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter italic leading-[0.9]">
              Is Your AI Promising What Your <span className="text-emerald-500 font-black tracking-tighter italic leading-[0.9]">Policy Prohibits?</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-3xl mx-auto leading-relaxed mb-12 italic border-l-2 border-emerald-500/30 pl-8 py-2">
              "Every 'helpful' AI response carries a hidden price tag. When an agent extends a refund window or waives a shipping fee, it isn’t just being polite—it’s creating <span className="text-white font-bold underline decoration-red-500/50">unvetted financial liability.</span> Truthifier intercepts the drift, cross-verifying every numerical promise against your institutional constraints in real-time."
            </p>
          </section>
        )}

        <section className="max-w-3xl mx-auto">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-1 shadow-2xl">
            <div className="p-8 md:p-12">
              {!results ? (
                <div className="space-y-8">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4 block underline decoration-emerald-500/20 underline-offset-4">01 // TRUTH SOURCE (POLICY)</label>
                    <textarea 
                      className="w-full bg-black border border-white/10 rounded-xl p-5 text-sm text-emerald-500 font-mono focus:border-emerald-500/50 outline-none h-40 transition-all"
                      placeholder="Paste your strict corporate policies here..."
                      value={truthSource}
                      onChange={(e) => setTruthSource(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4 block underline decoration-emerald-500/20 underline-offset-4">02 // DATASET UPLOAD</label>
                    <div className="bg-black border border-white/10 border-dashed rounded-2xl p-16 text-center hover:border-emerald-500/40 transition cursor-pointer group">
                      <input type="file" className="hidden" id="log-upload" onChange={handleUpload} accept=".json" />
                      <label htmlFor="log-upload" className="cursor-pointer">
                        {loading ? <Loader2 className="animate-spin mx-auto text-emerald-500" size={40} /> : (
                          <div className="bg-emerald-600 hover:bg-emerald-500 text-black px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 transition transform group-hover:scale-105">
                            Analyze Dataset <ChevronRight size={16} />
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  
                  {/* MINIMALISTIC FORENSIC TILES */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-black border border-white/5 p-5 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Liability Exposure // <span className="italic font-normal">Annual Est.</span></p>
                      <div className="flex items-baseline gap-1 text-white">
                        <span className="text-red-500 text-sm font-bold">$</span>
                        <span className="text-2xl font-black italic tracking-tighter">{(results.issues * 120 * 12).toLocaleString()}</span>
                        <span className="text-[8px] font-bold text-slate-600 ml-1 uppercase">USD</span>
                      </div>
                    </div>

                    <div className="bg-black border border-white/5 p-5 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Institutional Drift</p>
                      <div className="flex items-baseline gap-1 text-white">
                        <span className="text-2xl font-black italic tracking-tighter">{Math.round((results.issues / results.detailedResults.length) * 100)}</span>
                        <span className="text-emerald-500 text-sm font-bold">%</span>
                      </div>
                    </div>

                    <div className="bg-black border border-white/5 p-5 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Audit Score</p>
                      <div className="flex items-baseline gap-1 text-emerald-500">
                        <span className="text-2xl font-black italic tracking-tighter">{results.score}</span>
                        <span className="text-[8px] font-bold text-slate-600 ml-1 uppercase">Forensic</span>
                      </div>
                    </div>
                  </div>

                  {/* MINIMALIST ROADMAP REQUESTER */}
                  {results.score < 100 && (
                    <div className="mb-12 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">03 // Institutional Mitigation Roadmap</p>
                      <form onSubmit={handleLeadSubmit} className="flex flex-col md:flex-row gap-2">
                        <input 
                          type="email" required
                          placeholder="corporate-security@company.com" 
                          className="bg-black border border-white/10 rounded-xl px-4 py-3 text-[11px] flex-1 outline-none text-emerald-500 font-mono placeholder:text-emerald-900/30"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <button 
                          disabled={isSubmitting}
                          className="bg-emerald-600 hover:bg-emerald-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition"
                        >
                          {isSubmitting ? 'Securing...' : 'Secure Analysis'}
                        </button>
                      </form>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
                    <h2 className="text-lg font-black text-white italic tracking-tighter">SWEEP COMPLETE</h2>
                    <div className="flex gap-4">
                      <button onClick={() => window.print()} className="bg-emerald-600 text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-emerald-500 transition">
                        PDF Report
                      </button>
                      <button onClick={() => setResults(null)} className="text-[9px] font-bold uppercase text-slate-600 hover:text-white transition">Reset</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {results.detailedResults?.map((res: any, i: number) => (
                      <div key={i} className={`bg-black border rounded-xl overflow-hidden ${res.status === 'FLAGGED' ? 'border-red-500/20' : 'border-white/5'}`}>
                        <div className="px-6 py-2 bg-white/5 flex justify-between items-center border-b border-white/5">
                          <span className="text-[8px] font-mono text-slate-500 uppercase font-bold tracking-[0.1em]">LOG_ENTRY_{res.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${res.riskLevel === 'HIGH' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'}`}>
                            {res.riskLevel || res.status}
                          </span>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-8 items-start text-xs">
                          <p className="text-slate-400 italic leading-relaxed">"{res.originalResponse}"</p>
                          <ul className="space-y-3 border-l border-white/5 pl-8">
                            {res.violationList?.map((v: string, idx: number) => (
                              <li key={idx} className="text-slate-200 flex items-start gap-2">
                                <ArrowRight size={10} className="mt-1 shrink-0 text-emerald-500" /> 
                                <span>{v}</span>
                              </li>
                            )) || <li className="text-slate-500 flex items-center gap-2 italic"><CheckCircle2 size={10} /> Verified Compliant.</li>}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}