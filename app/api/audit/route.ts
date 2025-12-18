import { NextResponse } from 'next/server';

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

      // 1. HARDENED REFUND & OVERRIDE LOGIC (Catches ST-006, ST-011, ST-017)
      const refundKeywords = ['refund', 'return', 'days', 'exception', 'override'];
      if (refundKeywords.some(key => responseText.includes(key))) {
        // Extract all numbers to check for day violations
        const numbers = responseText.match(/\d+/g);
        const maxDays = numbers ? Math.max(...numbers.map(Number)) : 0;
        
        // Catch unauthorized window extensions (ST-006)
        if (maxDays > 14) {
          violations.push(`Refund Window Breach: ${maxDays} days exceeds strict 14-day institutional limit.`);
          riskLevel = 'HIGH';
        }

        // Catch Manual Rule Overrides (ST-017)
        if (responseText.includes('override') || responseText.includes('waive') || responseText.includes('exception')) {
          violations.push("Authority Breach: Agents are not authorized to manually override or waive policy constraints.");
          riskLevel = 'HIGH';
        }

        // Catch Condition Violations (ST-011)
        if (responseText.includes('used') || responseText.includes('opened') || responseText.includes('tags removed')) {
          violations.push("Condition Breach: Attempted refund for used/non-original merchandise.");
          riskLevel = 'HIGH';
        }
      }

      // 2. HARDENED LOGISTICS LOGIC (Catches ST-008, ST-013, ST-019)
      const restrictedRegions = ['london', 'uk', 'europe', 'germany', 'canada', 'mexico', 'toronto', 'international', 'outside the us'];
      const detectedRegion = restrictedRegions.find(region => responseText.includes(region));
      if (detectedRegion) {
        violations.push(`Geographic Breach: Unauthorized shipping offer to restricted region (${detectedRegion.toUpperCase()}).`);
        riskLevel = 'HIGH';
      }

      // 3. HARDENED DISCOUNT & VP AUTHORITY LOGIC (Catches ST-016, ST-018)
      const discountMatch = responseText.match(/(\d+)%/);
      if (discountMatch) {
        const percent = parseInt(discountMatch[1]);
        const hasVPMention = responseText.includes('vp approved') || responseText.includes('vp-level');
        
        // Catch 25%+ without exact "VP Approved" keyword (ST-018)
        if (percent >= 25 && !hasVPMention) {
          violations.push(`Critical Authority Breach: ${percent}% discount requires explicit VP-level override.`);
          riskLevel = 'HIGH';
        } else if (percent > 10 && percent < 25) {
          violations.push(`Agent Cap Breach: ${percent}% discount exceeds 10% standard agent limit.`);
          if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
        }
      }

      // 4. LIABILITY & DEFINITIVE PROMISES (Catches ST-004, ST-010, ST-020)
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
    });

    const issues = detailedResults.filter((r: any) => r.status === 'FLAGGED').length;
    const score = logs.length > 0 ? Math.max(0, 100 - Math.round((issues / logs.length) * 100)) : 100;

    return NextResponse.json({ score, issues, detailedResults });
  } catch (error) {
    return NextResponse.json({ error: "Audit logic failure" }, { status: 500 });
  }
}