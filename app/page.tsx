"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, UploadCloud, ChevronRight, 
  Loader2, CheckCircle2, XCircle, FileText, Download, 
  Zap, ArrowRight, Printer, TrendingDown, DollarSign, Activity
} from 'lucide-react';

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
      alert("Protocol Analysis Failed.");
    } finally {
      setLoading(false);
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
              Is Your AI Promising What Your <span className="text-emerald-500 font-black">Policy Prohibits?</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-3xl mx-auto leading-relaxed mb-12 italic border-l-2 border-emerald-500/30 pl-8 py-2">
              "Every 'helpful' AI response carries a hidden price tag. When an agent extends a refund window or waives a shipping fee, it isn’t just being polite—it’s creating <span className="text-white font-bold underline decoration-red-500/50">unvetted financial liability.</span> Truthifier intercepts the drift, cross-verifying every numerical promise against your institutional constraints in real-time."
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
              <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-white/5 shadow-2xl">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                  <ShieldCheck className="text-emerald-500" size={16} /> Forensic Solution
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Truthifier provides a forensic verification layer. We cross-reference every claim against your institutional "Truth Source" to ensure 100% policy compliance.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-white/5 shadow-2xl">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2 italic uppercase tracking-widest text-[10px]">
                  <Zap className="text-emerald-500" size={16} /> The Mission
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  To eliminate AI hallucinations and establish the global standard for Factual Integrity in enterprise intelligence.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Protocol Terminal */}
        <div id="terminal" className="text-center mb-12 print:hidden">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase underline underline-offset-8 decoration-emerald-500/50">
            Protocol Terminal.
          </h2>
        </div>

        <section className="max-w-3xl mx-auto">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-1 shadow-2xl shadow-emerald-500/5">
            <div className="p-8 md:p-12">
              {!results ? (
                <div className="space-y-8">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4 block">01 // TRUTH SOURCE (INSTITUTIONAL POLICY)</label>
                    <textarea 
                      className="w-full bg-black border border-white/10 rounded-xl p-5 text-sm text-emerald-500 font-mono focus:border-emerald-500/50 outline-none h-40 transition-all placeholder:text-emerald-900/50"
                      placeholder="Paste your strict corporate policies here..."
                      value={truthSource}
                      onChange={(e) => setTruthSource(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4 block">02 // DATASET UPLOAD</label>
                    <div className="bg-black border border-white/10 border-dashed rounded-2xl p-16 text-center hover:border-emerald-500/40 transition cursor-pointer group">
                      <input type="file" className="hidden" id="log-upload" onChange={handleUpload} accept=".json" />
                      <label htmlFor="log-upload" className="cursor-pointer">
                        {loading ? <Loader2 className="animate-spin mx-auto text-emerald-500" size={40} /> : (
                          <div className="bg-emerald-600 hover:bg-emerald-500 text-black px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 transition transform group-hover:scale-105 shadow-xl shadow-emerald-500/10">
                            Analyze Dataset <ChevronRight size={16} />
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  
                  {/* MINIMALIST FORENSIC TILES */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-black border border-white/5 p-5 rounded-xl shadow-lg">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
                        Liability Exposure // <span className="italic font-normal">Annual Est.</span>
                      </p>
                      <div className="flex items-baseline gap-1 text-white">
                        <span className="text-red-500 text-sm font-bold">$</span>
                        <span className="text-2xl font-black italic tracking-tighter">
                          {(results.issues * 120 * 12).toLocaleString()}
                        </span>
                        <span className="text-[8px] font-bold text-slate-600 ml-1 uppercase">USD</span>
                      </div>
                    </div>

                    <div className="bg-black border border-white/5 p-5 rounded-xl shadow-lg">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Institutional Drift</p>
                      <div className="flex items-baseline gap-1 text-white">
                        <span className="text-2xl font-black italic tracking-tighter">
                          {Math.round((results.issues / results.detailedResults.length) * 100)}
                        </span>
                        <span className="text-emerald-500 text-sm font-bold">%</span>
                      </div>
                    </div>

                    <div className="bg-black border border-white/5 p-5 rounded-xl shadow-lg">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Audit Score</p>
                      <div className="flex items-baseline gap-1 text-emerald-500">
                        <span className="text-2xl font-black italic tracking-tighter">
                          {results.score}
                        </span>
                        <span className="text-[8px] font-bold text-slate-600 ml-1 uppercase">Forensic</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/5 pb-8">
                    <div>
                      <h2 className="text-lg font-black text-white italic tracking-tighter">FORENSIC SWEEP COMPLETE</h2>
                      <p className="text-emerald-500 font-mono text-[9px] uppercase tracking-[0.2em] mt-2">
                        {results.issues} Policy Breaches Identified
                      </p>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                      <button onClick={() => window.print()} className="bg-emerald-600 text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition flex items-center gap-2">
                        <Printer size={12} /> PDF Report
                      </button>
                      <button onClick={() => setResults(null)} className="text-[9px] font-bold uppercase text-slate-600 hover:text-white transition underline underline-offset-4 tracking-widest">Reset</button>
                    </div>
                  </div>

                  {/* Comparison Rows */}
                  <div className="space-y-4 mb-12">
                    {results.detailedResults?.map((res: any, i: number) => (
                      <div key={i} className={`bg-black border rounded-xl overflow-hidden transition ${res.status === 'FLAGGED' ? 'border-red-500/20 shadow-lg shadow-red-500/5' : 'border-white/5'}`}>
                        <div className="px-6 py-2 bg-white/5 flex justify-between items-center border-b border-white/5">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">LOG_ENTRY_{res.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${res.riskLevel === 'HIGH' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'}`}>
                            {res.riskLevel || res.status}
                          </span>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-8 items-start">
                          <div className="space-y-2">
                            <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">AI Agent Output</p>
                            <p className="text-xs text-slate-400 italic leading-relaxed">"{res.originalResponse}"</p>
                          </div>
                          <div className="border-l border-white/5 pl-8">
                            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Institutional Correction</p>
                            <ul className="space-y-3">
                              {res.violationList && res.violationList.length > 0 ? (
                                res.violationList.map((v: string, idx: number) => (
                                  <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                                    <ArrowRight size={10} className="mt-1 shrink-0 text-emerald-500" /> 
                                    <span className="leading-tight">{v}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-xs text-slate-500 italic flex items-center gap-2">
                                  <CheckCircle2 size={10} className="text-emerald-500" /> Verified 100% Compliant.
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* LEAD CAPTURE */}
                  {results.score < 100 && (
                    <div className="p-10 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 text-center print:hidden shadow-3xl">
                      <div className="mb-4 inline-block p-4 rounded-full bg-emerald-500/10 text-emerald-500">
                        <ShieldCheck size={28} />
                      </div>
                      <h4 className="text-white font-black text-xl italic tracking-tighter mb-2 italic underline decoration-emerald-500/30">Request Mitigation Roadmap</h4>
                      <p className="text-[11px] text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">Critical liability detected in agent interactions. Submit corporate credentials for a full exposure analysis.</p>
                      <div className="flex flex-col md:flex-row gap-2 max-w-md mx-auto">
                        <input 
                          type="email" 
                          placeholder="security@enterprise.com" 
                          className="bg-black border border-white/10 rounded-xl px-4 py-3 text-xs flex-1 outline-none text-emerald-500 focus:border-emerald-500 transition shadow-inner"
                        />
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-lg shadow-emerald-500/20">Secure</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}