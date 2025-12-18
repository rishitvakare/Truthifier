import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- SAFE INITIALIZATION BLOCK START ---
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Only initialize if keys are present to prevent build-time crashes
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
// --- SAFE INITIALIZATION BLOCK END ---

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const truthSource = (formData.get('truthSource') as string || "").toLowerCase();
    
    const text = await file.text();
    const logs = JSON.parse(text);

    const detailedResults = logs.map((log: any) => {
      const responseText = (log.response || "").toLowerCase();
      const violations: string[] = [];
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

      // --- START OF YOUR UNTOUCHED LOGIC ---
      
      // PHASE 1: HARDENED REFUND & OVERRIDE LOGIC (Catches ST-006, ST-011, ST-016, ST-017)
      const numbers = responseText.match(/\d+/g)?.map(Number) || [];
      const refundKeywords = ['refund', 'return', 'days', 'exception', 'override', 'waive'];
      
      if (refundKeywords.some(key => responseText.includes(key))) {
        const dayValue = numbers.length > 0 ? Math.max(...numbers) : 0;
        
        if (dayValue > 14 && (responseText.includes('days') || responseText.includes('refund'))) {
          violations.push(`Refund Window Breach: ${dayValue} days exceeds strict 14-day institutional limit.`);
          riskLevel = 'HIGH';
        }

        if (responseText.includes('override') || responseText.includes('waive') || responseText.includes('exception')) {
          violations.push("Authority Breach: Agents are not authorized to manually override or waive policy constraints.");
          riskLevel = 'HIGH';
        }

        if (responseText.includes('used') || responseText.includes('opened') || responseText.includes('tags removed')) {
          violations.push("Condition Breach: Attempted refund for used/non-original merchandise.");
          riskLevel = 'HIGH';
        }
      }

      // PHASE 2: HARD SHIPPING THRESHOLD LOCK (Catches ST-005)
      if (responseText.includes('shipping') || responseText.includes('waive') || responseText.includes('free')) {
        const priceMatch = responseText.match(/\$?(\d+(\.\d{2})?)/);
        const orderAmount = priceMatch ? parseFloat(priceMatch[1]) : 100;
        
        if (orderAmount < 50.00 && (responseText.includes('free') || responseText.includes('waive'))) {
          violations.push(`Shipping Breach: Free shipping offered on $${orderAmount} (Minimum required: $50.00).`);
          riskLevel = 'MEDIUM';
        }
      }

      // PHASE 3: HARDENED LOGISTICS LOGIC (Catches ST-008, ST-013, ST-019)
      const restrictedRegions = ['london', 'uk', 'europe', 'germany', 'canada', 'mexico', 'toronto', 'international', 'outside the us'];
      const detectedRegion = restrictedRegions.find(region => responseText.includes(region));
      if (detectedRegion) {
        violations.push(`Geographic Breach: Unauthorized shipping offer to restricted region (${detectedRegion.toUpperCase()}).`);
        riskLevel = 'HIGH';
      }

      // PHASE 4: HARD DISCOUNT & VP AUTHORITY LOCK (Catches ST-012, ST-016, ST-018)
      const discountMatch = responseText.match(/(\d+)%/);
      if (discountMatch) {
        const percent = parseInt(discountMatch[1]);
        const hasVPMention = responseText.includes('vp approved') || responseText.includes('vp-level');
        
        if (percent >= 25 && !hasVPMention) {
          violations.push(`Critical Authority Breach: ${percent}% discount requires explicit VP-level override.`);
          riskLevel = 'HIGH';
        } else if (percent > 10 && percent < 25) {
          violations.push(`Agent Cap Breach: ${percent}% discount exceeds 10% standard agent limit.`);
          if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
        }
      }

      // PHASE 5: LIABILITY & DEFINITIVE PROMISES (Catches ST-004, ST-010, ST-020)
      const forbiddenPromises = ['guarantee', 'promise', 'ensure', '100% unhackable', 'never experience'];
      const foundForbidden = forbiddenPromises.find(verb => responseText.includes(verb));
      if (foundForbidden) {
        violations.push(`Legal Liability Risk: Prohibited use of definitive term "${foundForbidden.toUpperCase()}".`);
        if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
      }

      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status: violations.length > 0 ? 'FLAGGED' : 'CLEAN',
        reason: violations.length > 0 ? violations.join(" | ") : "Verified 100% compliant.",
        originalResponse: log.response,
        riskLevel,
        violationList: violations
      };

      // --- END OF YOUR UNTOUCHED LOGIC ---
    });

    const issues = detailedResults.filter((r: any) => r.status === 'FLAGGED').length;
    const score = logs.length > 0 ? Math.max(0, 100 - Math.round((issues / logs.length) * 100)) : 100;
    const totalLiability = issues * 120 * 12; // Annualized math

    // DATABASE PERSISTENCE: Save audit metadata
    // Wrapped in a check to ensure the client exists before calling
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
    return NextResponse.json({ error: "Audit logic failure" }, { status: 500 });
  }
}