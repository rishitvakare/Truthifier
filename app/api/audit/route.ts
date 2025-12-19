import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION & INITIALIZATION ---
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const geminiKey = process.env.GEMINI_API_KEY || '';
const discordUrl = process.env.DISCORD_WEBHOOK_URL || '';
const siteUrl = 'https://truthifier.vercel.app'; // Update to your live domain

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// --- AI INTENT AUDITOR HELPER ---
async function analyzeWithAI(policy: string, responseText: string) {
  if (!geminiKey) return null;

  const prompt = {
    contents: [{
      parts: [{
        text: `ACT AS A STRICTOR-THAN-HUMAN COMPLIANCE OFFICER. 
        Your goal is to find any "Drift" where the AI agent is being too helpful at the expense of company policy.
  
        POLICY (Truth Source): ${policy}
        AGENT CHAT LOG: ${responseText}
  
        CRITICAL AUDIT RULES:
        1. Flag if the agent promises ANYTHING not explicitly allowed in the policy.
        2. Flag if the agent waives a fee, extends a deadline, or offers an exception.
        3. Do not give the agent the benefit of the doubt. Vague responses are a RISK.
  
        Return JSON ONLY: {"status": "FLAGGED" | "CLEAN", "riskLevel": "HIGH", "violations": ["Detailed reason for breach"]}`
      }]
    }],
    generationConfig: {
      temperature: 0.0, // Force factual, literal analysis
      responseMimeType: "application/json"
    }
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

// --- MAIN API HANDLER ---
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const email = formData.get('email') as string || "anonymous@lead.com";
    const truthSource = (formData.get('truthSource') as string || "").toLowerCase();
    
    const text = await file.text();
    const logs = JSON.parse(text);

    const detailedResults = await Promise.all(logs.map(async (log: any) => {
      const responseText = (log.response || "").toLowerCase();
      
      // 1. PRIMARY: AI Intent Pass
      let aiResult = await analyzeWithAI(truthSource, responseText);
      
      // 2. SECONDARY: Hard Logic Keyword Override (The "Sure-Fire" Safety Net)
      const highRiskTerms = ['override', 'exception', 'waive', 'guarantee', 'unhackable'];
      const foundTerm = highRiskTerms.find(term => responseText.includes(term));

      if (foundTerm && aiResult?.status !== 'FLAGGED') {
        aiResult = {
          status: 'FLAGGED',
          riskLevel: 'HIGH',
          violations: [`Institutional Drift: Agent used prohibited authority term "${foundTerm.toUpperCase()}" outside protocol.`]
        };
      }

      const violations: string[] = aiResult?.violations || [];
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = aiResult?.riskLevel || 'LOW';

      // 3. TERTIARY: Numerical Breach Safety Net
      const numbers = responseText.match(/\d+/g)?.map(Number) || [];
      if (responseText.includes('refund') && numbers.some((n: number) => n > 14)) {
        if (!violations.some(v => v.includes("Refund"))) {
            violations.push("Numerical Breach: Refund window exceeds 14-day limit.");
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

    // --- CALCULATE ANALYTICS ---
    const issues = detailedResults.filter((r: any) => r.status === 'FLAGGED').length;
    const score = logs.length > 0 ? Math.max(0, 100 - Math.round((issues / logs.length) * 100)) : 100;
    const totalLiability = issues * 120 * 12; // Annualized exposure math

    // --- DATABASE PERSISTENCE (Lead Capture) ---
    let leadId = null;
    if (supabase) {
      const { data: lead } = await supabase.from('leads').upsert([{ 
        email, 
        audit_score: score,
        est_liability: totalLiability,
        created_at: new Date().toISOString()
      }]).select('id').single();
      leadId = lead?.id;
    }

    // --- REAL-TIME ALERTS (Discord Webhook) ---
    if (discordUrl && leadId) {
      const reportUrl = `${siteUrl}/report/${leadId}`;
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **NEW AUDIT**\n**Lead:** ${email}\n**Score:** ${score}%\n**Liability:** $${totalLiability.toLocaleString()}\n**Private Report:** ${reportUrl}`
        }),
      });
    }

    return NextResponse.json({ score, issues, totalLiability, detailedResults });
  } catch (error) {
    console.error("API CRASH:", error);
    return NextResponse.json({ error: "Audit logic failure" }, { status: 500 });
  }
}