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

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto py-8 px-6 flex justify-between items-center print:hidden">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2 text-white italic">
          <Zap className="text-emerald-500 fill-emerald-500" size={24} /> TRUTHIFIER
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <a href="#mission" className="hover:text-emerald-500 transition">Mission</a>
          <a href="#terminal" className="hover:text-emerald-500 transition">Terminal</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pt-12 pb-32 px-6">
        {/* Mission & Problem Section */}
        <section id="mission" className="mb-24 text-center print:hidden">
          <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
            Enterprise Integrity Protocol
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter italic">
            AI Truth <span className="text-emerald-500">Protocol.</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            The Problem: <span className="text-slate-300">Generative AI is inherently creative, not factual.</span> Unchecked hallucinations create massive legal and institutional liability.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-white/5">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
                <ShieldCheck className="text-emerald-500" size={18} /> Our Solution
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Truthifier provides a forensic layer for LLM outputs. We cross-reference claims against your institutional "Truth Source" to ensure every word is grounded in fact.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-white/5">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2 italic uppercase tracking-widest text-xs">
                <Zap className="text-emerald-500" size={18} /> The Mission
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                To build the global standard for AI Factual Integrity, transforming generative outputs into reliable, institutional-grade intelligence.
              </p>
            </div>
          </div>
        </section>

        {/* Terminal Header */}
        <div id="terminal" className="text-center mb-12 print:hidden">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase underline underline-offset-8 decoration-emerald-500">
            Protocol Terminal.
          </h2>
        </div>

        {/* Terminal Content */}
        <section className="max-w-3xl mx-auto">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-1 shadow-2xl shadow-emerald-500/5">
            <div className="p-8 md:p-12">
              {!results ? (
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-4 block">01 // TRUTH SOURCE (INSTITUTIONAL POLICY)</label>
                    <textarea 
                      className="w-full bg-black border border-white/10 rounded-xl p-5 text-sm text-emerald-500 font-mono focus:border-emerald-500/50 outline-none h-40 transition-all placeholder:text-emerald-900/50"
                      placeholder="Paste policy documentation here..."
                      value={truthSource}
                      onChange={(e) => setTruthSource(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-4 block">02 // DATASET UPLOAD</label>
                    <div className="bg-black border border-white/10 border-dashed rounded-2xl p-16 text-center hover:border-emerald-500/40 transition cursor-pointer group">
                      <input type="file" className="hidden" id="log-upload" onChange={handleUpload} accept=".json" />
                      <label htmlFor="log-upload" className="cursor-pointer">
                        {loading ? <Loader2 className="animate-spin mx-auto text-emerald-500" size={40} /> : (
                          <div className="bg-emerald-600 hover:bg-emerald-500 text-black px-12 py-4 rounded-full font-black text-sm uppercase tracking-tighter inline-flex items-center gap-2 transition transform group-hover:scale-105 shadow-xl shadow-emerald-500/10">
                            Analyze Dataset <ChevronRight size={18} />
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Results Display */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/5 pb-8">
                    <div>
                      <h2 className="text-4xl font-black text-white italic">INTEGRITY: {results.score}%</h2>
                      <p className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest mt-2">Analysis Complete // {results.issues} Violations Detected</p>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                      <button onClick={() => window.print()} className="bg-emerald-600 text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition flex items-center gap-2">
                        <Download size={14} /> PDF Report
                      </button>
                      <button onClick={() => setResults(null)} className="text-[10px] font-bold uppercase text-slate-600 hover:text-white transition underline underline-offset-4 tracking-widest">Reset</button>
                    </div>
                  </div>

                  {/* Comparison Rows */}
                  <div className="space-y-4 mb-12">
                    {results.detailedResults?.map((res: any, i: number) => (
                      <div key={i} className="bg-black border border-white/5 rounded-xl overflow-hidden print:bg-white print:border-slate-200">
                        <div className="px-6 py-2 bg-white/5 flex justify-between items-center border-b border-white/5 print:bg-slate-50">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">LOG_ENTRY_{res.id}</span>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getRiskColor(res.riskLevel)}`}>
                            {res.riskLevel || res.status}
                          </span>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-8 items-center print:grid-cols-1">
                          <div className="space-y-2">
                            <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">AI OUTPUT</p>
                            <p className="text-xs text-slate-400 italic">"{res.originalResponse}"</p>
                          </div>
                          <div className="flex gap-4 items-start border-l border-white/5 pl-8 print:border-l-2 print:border-emerald-500 print:pl-4 print:mt-4">
                            <ArrowRight className="text-emerald-500 shrink-0 mt-1 print:hidden" size={14} />
                            <div>
                              <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">TRUTHIFIER CORRECTION</p>
                              <p className="text-xs text-slate-300 leading-relaxed">{res.reason}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lead Capture Email Box */}
                  {results.score < 100 && (
                    <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 text-center print:hidden">
                      <h4 className="text-white font-black text-xl italic tracking-tighter mb-2">Request Mitigation Strategy</h4>
                      <p className="text-xs text-slate-500 mb-6">Enter your email to receive a private forensic breakdown and hallucination defense roadmap.</p>
                      <div className="flex gap-2 max-w-sm mx-auto">
                        <input 
                          type="email" 
                          placeholder="security@enterprise.com" 
                          className="bg-black border border-emerald-500/20 rounded-xl px-4 py-3 text-xs flex-1 outline-none text-emerald-500 focus:border-emerald-500 transition"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-tighter transition">Secure</button>
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