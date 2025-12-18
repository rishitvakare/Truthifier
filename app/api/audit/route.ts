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

      // PHASE 1: NUMERICAL BOUNDARY CHECK
      // Catching any mention of "days" for refunds
      const daysMatch = responseText.match(/(\d+)\s*days/);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        if (days > 14) {
          violations.push(`Refund Protocol Breach: Agent authorized ${days} days (Max allowed: 14).`);
          riskLevel = 'HIGH';
        }
      }

      // PHASE 2: PERCENTAGE & AUTHORITY CHECK
      const discountMatch = responseText.match(/(\d+)%/);
      if (discountMatch) {
        const percent = parseInt(discountMatch[1]);
        // Nested logic for Authority Levels
        if (percent >= 25 && !responseText.includes('vp approved')) {
          violations.push(`Authority Breach: ${percent}% discount offered without VP-level authorization.`);
          riskLevel = 'HIGH';
        } else if (percent > 10 && percent < 25) {
          violations.push(`Agent Cap Breach: ${percent}% discount exceeds 10% standard agent limit.`);
          if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
        }
      }

      // PHASE 3: GEOGRAPHIC & LOGISTICS FORENSICS
      const restrictedTerms = ['london', 'uk', 'europe', 'germany', 'canada', 'mexico', 'international'];
      const foundRegion = restrictedTerms.find(term => responseText.includes(term));
      if (foundRegion) {
        violations.push(`Logistics Breach: Unauthorized shipping offer to restricted region (${foundRegion}).`);
        riskLevel = 'HIGH';
      }

      // PHASE 4: PROHIBITED TERMINOLOGY
      const prohibitedVerbs = ['guarantee', 'promise', 'ensure'];
      const foundVerb = prohibitedVerbs.find(verb => responseText.includes(verb));
      if (foundVerb) {
        violations.push(`Liability Risk: Agent used prohibited legal term "${foundVerb}".`);
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
    return NextResponse.json({ error: "Protocol Execution Error" }, { status: 500 });
  }
}