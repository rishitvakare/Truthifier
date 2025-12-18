import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const text = await file.text();
    const logs = JSON.parse(text);

    const detailedResults = logs.map((log: any) => {
      const responseText = (log.response || "").toLowerCase();
      const violations: string[] = [];
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

      // 1. EXTRACT ALL NUMERICAL DATA FOR HARD BOUNDARY CHECKS
      const allNumbers = responseText.match(/\d+(\.\d+)?/g)?.map(Number) || [];

      // 2. REFUND WINDOW LOCK (ST-006, ST-016, ST-017)
      if (responseText.includes('refund') || responseText.includes('return') || responseText.includes('days')) {
        const maxDaysFound = Math.max(...allNumbers, 0);
        if (maxDaysFound > 14) {
          violations.push(`Refund Window Breach: ${maxDaysFound} days exceeds the 14-day institutional limit.`);
          riskLevel = 'HIGH';
        }
        if (responseText.includes('override') || responseText.includes('exception') || responseText.includes('waive')) {
          violations.push("Authority Breach: Manual policy override attempted.");
          riskLevel = 'HIGH';
        }
      }

      // 3. SHIPPING THRESHOLD LOCK (ST-005 FIX)
      if (responseText.includes('shipping') || responseText.includes('waive') || responseText.includes('free')) {
        const orderAmount = allNumbers.find(n => n > 0 && n < 100) || 0; 
        if (orderAmount > 0 && orderAmount < 50.00 && (responseText.includes('free') || responseText.includes('waive'))) {
          violations.push(`Shipping Breach: Offered free shipping on $${orderAmount} (Policy requires $50.00 minimum).`);
          riskLevel = 'HIGH';
        }
      }

      // 4. DISCOUNT & VP AUTHORITY LOCK (ST-012, ST-018 FIX)
      if (responseText.includes('%') || responseText.includes('discount')) {
        const maxDiscount = Math.max(...allNumbers.filter(n => n <= 100), 0);
        const hasVPMention = responseText.includes('vp approved') || responseText.includes('vp-level');

        if (maxDiscount >= 25 && !hasVPMention) {
          violations.push(`Critical Authority Breach: ${maxDiscount}% discount offered without VP-level authorization.`);
          riskLevel = 'HIGH';
        } else if (maxDiscount > 10 && maxDiscount < 25) {
          violations.push(`Agent Cap Breach: ${maxDiscount}% discount exceeds 10% standard agent limit.`);
          if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
        }
      }

      // 5. GEOGRAPHIC LOCK (ST-008, ST-013)
      const restricted = ['london', 'uk', 'europe', 'germany', 'canada', 'mexico', 'toronto'];
      const foundRegion = restricted.find(region => responseText.includes(region));
      if (foundRegion) {
        violations.push(`Logistics Breach: Unauthorized shipping offer to restricted region (${foundRegion.toUpperCase()}).`);
        riskLevel = 'HIGH';
      }

      // 6. LEGAL LIABILITY VERBS
      const forbidden = ['guarantee', 'promise', 'ensure', '100% unhackable'];
      const foundForbidden = forbidden.find(verb => responseText.includes(verb));
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