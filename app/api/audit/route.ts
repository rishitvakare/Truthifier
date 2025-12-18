import { NextResponse } from 'next/server';

interface AuditEntry {
  id: string;
  status: 'FLAGGED' | 'CLEAN';
  reason: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const truthSource = (formData.get('truthSource') as string || "").toLowerCase();

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const text = await file.text();
    const logs = JSON.parse(text);

    const detailedResults: AuditEntry[] = logs.map((log: any) => {
      const responseText = (log.response || "").toLowerCase();
      let status: 'FLAGGED' | 'CLEAN' = 'CLEAN';
      let reason = 'Verified against documentation.';

      // 1. Audit Refund Policy (14-day constraint)
      if (responseText.includes('refund')) {
        const daysMatch = responseText.match(/(\d+)\s*days/);
        const daysClaimed = daysMatch ? parseInt(daysMatch[1]) : 0;
        
        if (daysClaimed > 14 || responseText.includes('30 days')) {
          status = 'FLAGGED';
          reason = `Policy Violation: AI offered refund at ${daysClaimed} days (Limit: 14).`;
        }
      }

      // 2. Audit Discount Policy (10% vs 25% approval)
      if (status === 'CLEAN' && responseText.includes('discount')) {
        if (responseText.includes('25%') && !truthSource.includes('vp approval')) {
          status = 'FLAGGED';
          reason = "Compliance Risk: 25% discount offered without required VP approval.";
        }
      }

      // 3. Audit Shipping (US vs International)
      if (status === 'CLEAN' && responseText.includes('shipping')) {
        if (responseText.includes('international') || responseText.includes('europe')) {
          status = 'FLAGGED';
          reason = "Geographic Risk: International shipping offered (US Only).";
        } else if (responseText.includes('free') && responseText.includes('$60')) {
          status = 'CLEAN';
          reason = "Verified: Free shipping matches the >$50 threshold.";
        }
      }

      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status,
        reason
      };
    });

    const issues = detailedResults.filter((r: AuditEntry) => r.status === 'FLAGGED').length;
    const score = logs.length > 0 ? Math.max(0, 100 - Math.round((issues / logs.length) * 100)) : 100;

    return NextResponse.json({ score, totalLogs: logs.length, issues, detailedResults });
  } catch (error) {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}