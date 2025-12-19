import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function SharedReport({ params }: { params: { id: string } }) {
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!lead) notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-white p-12">
      <h1 className="text-4xl font-black italic italic mb-4">FORENSIC SUMMARY</h1>
      <p className="text-emerald-500 font-mono mb-8 underline underline-offset-4 decoration-emerald-500/20 lowercase">01 // TARGET: {lead.email}</p>
      
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Annualized Liability</p>
          <p className="text-3xl font-black text-red-500 italic">${Number(lead.est_liability).toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Audit Score</p>
          <p className="text-3xl font-black text-emerald-500 italic">{lead.audit_score}%</p>
        </div>
      </div>
    </div>
  );
}