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
      // Points to your new flattened route: app/audit/route.ts
      const response = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Audit failed');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      alert("Analysis failed. Ensure you are uploading a valid JSON file.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans px-6">
      <nav className="max-w-6xl mx-auto py-6 flex justify-between items-center border-b border-slate-800">
        <div className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-blue-500" /> Truthifier
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-20 text-center">
        <h1 className="text-5xl font-extrabold mb-6">Stop AI Hallucinations.</h1>
        <p className="text-slate-400 text-lg mb-10">Upload your logs for a free Audit.</p>

        {!results ? (
          <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-12 hover:border-blue-500/50 transition cursor-pointer">
            <input type="file" className="hidden" id="log-upload" onChange={handleUpload} accept=".json" />
            <label htmlFor="log-upload" className="cursor-pointer">
              {loading ? <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" /> : (
                <>
                  <UploadCloud className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold mb-6">Drop .json logs here</h3>
                  <div className="bg-blue-600 px-8 py-3 rounded-full font-bold inline-flex items-center gap-2">
                    Start Audit <ChevronRight size={18} />
                  </div>
                </>
              )}
            </label>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-left animate-in fade-in zoom-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-500">Score: {results.score}%</h2>
                <button onClick={() => setResults(null)} className="text-sm text-slate-500 underline">Reset</button>
             </div>
             <div className="space-y-3">
                {results.detailedResults?.map((res: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded border border-slate-700 flex justify-between items-center">
                    <span className="text-sm">{res.reason}</span>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${res.status === 'FLAGGED' ? 'bg-red-500' : 'bg-green-500'}`}>
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