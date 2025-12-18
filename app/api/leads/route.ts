import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Safe Initialization to prevent build crashes
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { email, auditScore, liability } = await req.json();

    if (!supabase) {
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 });
    }

    // This pushes the email and results into your Supabase 'leads' table
    const { error } = await supabase.from('leads').upsert([{ 
      email, 
      audit_score: auditScore,
      est_liability: liability,
      created_at: new Date().toISOString()
    }]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Persistence failure" }, { status: 500 });
  }
}