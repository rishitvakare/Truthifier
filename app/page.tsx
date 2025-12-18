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
    formData.append('truthSource', truthSource); // Sending the documentation context

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans px-6 pb-20">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto py-6 flex justify-between items-center border-b border-slate-800">
        <div className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-blue-500" /> VerifyAI
        </div>
        <div className="flex gap-6 text-sm text-slate-400">
          <a href="#mission" className="hover:text-white transition">Mission</a>
          <a href="#solution" className="hover:text-white transition">Solution</a>
        </div>
      </nav>

      {/* Hero Section & Mission */}
      <main className="max-w-4xl mx-auto pt-20 text-center">
        <section id="mission" className="mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Our Mission: <span className="text-blue-500 text-glow">Zero-Defect AI.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            We believe enterprise AI should be as reliable as a bank ledger. VerifyAI was built to 
            bridge the gap between LLM creativity and institutional accuracy.
          </p>
        </section>

        {/* Solution Grid */}
        <section id="solution" className="grid md:grid-cols-2 gap-8 mb-20 text-left">
          <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-blue-400" /> The Problem
            </h3>
            <p className="text-slate-400 text-sm">
              Standard LLMs are trained on the open web. When they handle your private customer support, 
              they often "hallucinate" promises, discounts, and policies that don't exist in your actual SOPs.
            </p>
          </div>
          <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-blue-400" /> Our Solution
            </h3>
            <p className="text-slate-400 text-sm">
              We provide a **Contextual Audit**. By comparing your chat logs against your specific 
              documentation (Truth Source), we pinpoint exactly where your AI drifted from the facts.
            </p>
          </div>
        </section>

        {/* Truth Source Input */}
        <div className="mb-8 text-left max-w-2xl mx-auto">
          <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-blue-400">
            <BookOpen size={16} /> Step 1: Add Truth Source (Your Documentation)
          </label>
          <textarea 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition h-32"
            placeholder="Paste your company policies or product specs here. We'll use this to verify the logs."
            value={truthSource}
            onChange={(e) => setTruthSource(e.target.value)}
          />
        </div>

        {/* Audit Tool */}
        {!results ? (
          <div className="max-w-2xl mx-auto">
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-blue-400 text-left">
              <FileText size={16} /> Step 2: Upload AI Logs
            </label>
            <div className={`bg-slate-900 border-2 border-dashed rounded-2xl p-12 transition group cursor-pointer ${loading ? 'border-blue-500/50 opacity-50' : 'border-slate-700 hover:border-blue-500/50'}`}>
              <input type="file" className="hidden" id="log-upload" onChange={handleUpload} accept=".json" />
              <label htmlFor="log-upload" className="cursor-pointer">
                {loading ? <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" /> : (
                  <>
                    <UploadCloud className="w-12 h-12 mx-auto mb-4 text-slate-500 group-hover:text-blue-500" />
                    <h3 className="text-xl font-semibold mb-4">Run Free Audit</h3>
                    <div className="bg-blue-600 px-8 py-3 rounded-full font-bold inline-flex items-center gap-2">
                      Analyze Log Integrity <ChevronRight size={18} />
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-10 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-left animate-in fade-in zoom-in">
             <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-3xl font-bold">Audit Score: <span className="text-blue-500">{results.score}%</span></h2>
                  <p className="text-slate-400">Based on provided Truth Source documentation.</p>
                </div>
                {/* Download Button */}
                <button 
                  onClick={() => window.print()} 
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition"
                >
                  <Download size={16} /> Download PDF Report
                </button>
             </div>
             {/* Results List */}
             <div className="space-y-4">
                {results.detailedResults?.map((res: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 flex justify-between items-center">
                    <span className="text-sm">{res.reason}</span>
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${res.status === 'FLAGGED' ? 'bg-red-500' : 'bg-green-500'}`}>
                      {res.status}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}