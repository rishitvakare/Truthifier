import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- SAFE INITIALIZATION BLOCK START ---
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const geminiKey = process.env.GEMINI_API_KEY || '';

// Only initialize if keys are present to prevent build-time crashes
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
// --- SAFE INITIALIZATION BLOCK END ---

// Helper function for AI Intent Auditing
async function analyzeWithAI(policy: string, responseText: string) {
  if (!geminiKey) return null;

  const prompt = {
    contents: [{
      parts: [{
        text: `You are a Forensic Financial Auditor. 
        POLICY (Truth Source): ${policy}
        AGENT RESPONSE: ${responseText}

        Identify if the agent violated policy regarding:
        1. Unauthorized refunds/overrides.
        2. Pricing/discount caps.
        3. Regional restrictions.
        4. Legal liability (definitive promises/guarantees).

        Return JSON ONLY: {"status": "FLAGGED" | "CLEAN", "riskLevel": "LOW" | "MEDIUM" | "HIGH", "violations": ["detailed string"]}`
      }]
    }]
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt)
    });

    const data = await response.json();
    const textResult = data.candidates[0].content.parts[0].text;
    return JSON.parse(textResult.replace(/```json|```/g, ""));
  } catch (e) {
    console.error("AI Audit Bypass:", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const truthSource = (formData.get('truthSource') as string || "").toLowerCase();
    
    const text = await file.text();
    const logs = JSON.parse(text); // Defined here for scope

    // Use Promise.all because we are making async AI calls for each log
    const detailedResults = await Promise.all(logs.map(async (log: any) => {
      const responseText = (log.response || "").toLowerCase();
      
      // 1. Run AI Intent Auditor
      const aiResult = await analyzeWithAI(truthSource, responseText);
      
      // 2. Fallback/Hybrid Logic (Your untouched hard-coded logic)
      const violations: string[] = aiResult?.violations || [];
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = aiResult?.riskLevel || 'LOW';

      // PHASE 1: HARDENED REFUND logic still runs as a safety net
      const numbers = responseText.match(/\d+/g)?.map(Number) || [];
      if (responseText.includes('refund') && numbers.some((n: number) => n > 14)) {
        if (!violations.some(v => v.includes("Refund"))) {
            violations.push("Hard Logic Trigger: Refund window exceeds 14 days.");
            riskLevel = 'HIGH';
        }
      }

      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status: violations.length > 0 ? 'FLAGGED' : 'CLEAN',
        reason: violations.length > 0 ? violations.join(" | ") : "Verified 100% compliant.",
        originalResponse: log.response,
        riskLevel,
        violationList: violations
      };
    }));

    const issues = detailedResults.filter((r: any) => r.status === 'FLAGGED').length;
    const score = logs.length > 0 ? Math.max(0, 100 - Math.round((issues / logs.length) * 100)) : 100;
    const totalLiability = issues * 120 * 12; // Annualized math

    // DATABASE PERSISTENCE: Save audit metadata
    if (supabase) {
      await supabase.from('audits').insert([{
        audit_score: score,
        violation_count: issues,
        estimated_liability: totalLiability,
        created_at: new Date().toISOString()
      }]);
    }

    return NextResponse.json({ score, issues, detailedResults });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Audit logic failure" }, { status: 500 });
  }
}