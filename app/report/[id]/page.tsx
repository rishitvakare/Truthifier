import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Zap, ShieldCheck, AlertTriangle } from 'lucide-react';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function SharedReport({ params }: { params: { id: string } }) {
  // 1. Fetch the specific lead/audit data
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!lead) notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-8 font-sans">
      <div className="max-w-3xl mx-auto border border-white/5 bg-[#0A0A0A] rounded-3xl p-12 shadow-2xl">
        <div className="flex justify-between items-center mb-12">
          <div className="text-xl font-black italic text-white flex items-center gap-2">
            <Zap className="text-emerald-500 fill-emerald-500" size={20} /> TRUTHIFIER
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Internal Risk Report // Ref: {lead.id}
          </div>
        </div>

        <h1 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">Forensic Summary</h1>
        <p className="text-slate-500 text-xs mb-12">Prepared for: <span className="text-emerald-500 font-mono">{lead.email}</span></p>

        {/* Forensic Tiles */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-black border border-white/5 p-6 rounded-2xl">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Annualized Liability</p>
            <div className="text-2xl font-black text-red-500 italic">${Number(lead.est_liability).toLocaleString()}</div>
          </div>
          <div className="bg-black border border-white/5 p-6 rounded-2xl">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Audit Score</p>
            <div className="text-2xl font-black text-emerald-500 italic">{lead.audit_score}%</div>
          </div>
        </div>

        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mb-12 text-xs leading-relaxed italic">
          "This report identifies institutional drift where AI agents have exceeded established Truth Source constraints, creating unvetted financial obligations."
        </div>

        <button className="w-full bg-emerald-600 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition">
          Download Mitigation Roadmap
        </button>
      </div>
    </div>
  );
}