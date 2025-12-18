import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const discordUrl = process.env.DISCORD_WEBHOOK_URL || '';
// Use your actual production domain here
const siteUrl = 'https://truthifier.vercel.app'; 

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { email, auditScore, liability } = await req.json();

    if (!supabase) return NextResponse.json({ error: "DB Error" }, { status: 500 });

    // 1. Save to Supabase and get the returning ID
    const { data, error } = await supabase
      .from('leads')
      .upsert([{ 
        email, 
        audit_score: auditScore,
        est_liability: liability,
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) throw error;

    // 2. Send Real-Time Clickable Link to Discord
    if (discordUrl && data) {
      const reportUrl = `${siteUrl}/report/${data.id}`;
      
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **NEW TRUTHIFIER LEAD**\n**Email:** ${email}\n**Annual Liability:** $${liability.toLocaleString()}\n**Forensic Report:** ${reportUrl}\n\n*Click the link above to verify the report before sending.*`
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Persistence failure" }, { status: 500 });
  }
}