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

      // 1. REFUND WINDOW CHECK
      if (responseText.includes('refund')) {
        const daysMatch = responseText.match(/(\d+)\s*days/);
        const days = daysMatch ? parseInt(daysMatch[1]) : 0;
        if (days > 14) {
          violations.push(`Refund Window: ${days} days exceeds 14-day limit.`);
          riskLevel = 'HIGH';
        }
      }

      // 2. DISCOUNT THRESHOLD CHECK
      const discountMatch = responseText.match(/(\d+)%/);
      if (discountMatch) {
        const percent = parseInt(discountMatch[1]);
        if (percent >= 25) {
          violations.push(`Critical Discount: ${percent}% requires VP Approval.`);
          riskLevel = 'HIGH';
        } else if (percent > 10) {
          violations.push(`Discount Violation: ${percent}% exceeds 10% agent cap.`);
          if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
        }
      }

      // 3. GEOGRAPHIC RESTRICTION CHECK
      const restrictedRegions = ['europe', 'asia', 'uk', 'london', 'germany', 'mexico', 'toronto', 'canada'];
      if (restrictedRegions.some(region => responseText.includes(region))) {
        violations.push("Logistics: Unauthorized international shipping offer.");
        riskLevel = 'HIGH';
      }

      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status: violations.length > 0 ? 'FLAGGED' : 'CLEAN',
        reason: violations.length > 0 ? violations.join(" | ") : "Verified compliant.",
        originalResponse: log.response,
        riskLevel,
        violationList: violations // Passing array for cleaner UI rendering
      };
    });

    const issues = detailedResults.filter((r: any) => r.status === 'FLAGGED').length;
    const score = logs.length > 0 ? Math.max(0, 100 - Math.round((issues / logs.length) * 100)) : 100;

    return NextResponse.json({ score, issues, detailedResults });
  } catch (error) {
    return NextResponse.json({ error: "Protocol Error" }, { status: 500 });
  }
}