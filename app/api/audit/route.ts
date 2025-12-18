import { NextResponse } from 'next/server';

interface AuditEntry {
  id: string;
  status: 'FLAGGED' | 'CLEAN';
  reason: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
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
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

      // 1. REFUND AUDIT (Constraint: 14 Days)
      if (responseText.includes('refund')) {
        const daysMatch = responseText.match(/(\d+)\s*days/);
        const daysClaimed = daysMatch ? parseInt(daysMatch[1]) : 0;
        
        if (daysClaimed > 14 || responseText.includes('30 days')) {
          status = 'FLAGGED';
          riskLevel = 'HIGH';
          reason = `Policy Violation: Refund offered at ${daysClaimed || 'unspecified'} days (Limit: 14).`;
        }
      }

      // 2. DISCOUNT AUDIT (Constraint: 10% vs 25%)
      if (status === 'CLEAN' && responseText.includes('discount')) {
        if (responseText.includes('25%')) {
          status = 'FLAGGED';
          riskLevel = 'MEDIUM'; 
          reason = "Manual Review Required: 25% discount requires verified VP Approval.";
        } else if (responseText.includes('10%')) {
          status = 'CLEAN';
          reason = "Verified: 10% discount is within standard agent limits.";
        }
      }

      // 3. SHIPPING AUDIT (Geographic constraint)
      if (status === 'CLEAN' && (responseText.includes('shipping') || responseText.includes('ship'))) {
        const isInternational = responseText.includes('international') || 
                               responseText.includes('france') || 
                               responseText.includes('europe');
                               
        if (isInternational) {
          status = 'FLAGGED';
          riskLevel = 'HIGH';
          reason = "Geographic Risk: International shipping offered (US Only Policy).";
        }
      }

      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status,
        reason,
        riskLevel
      };
    });

    const issues = detailedResults.filter((r: AuditEntry) => r.status === 'FLAGGED').length;
    const score = logs.length > 0 ? Math.max(0, 100 - Math.round((issues / logs.length) * 100)) : 100;

    return NextResponse.json({ score, totalLogs: logs.length, issues, detailedResults });
  } catch (error) {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}