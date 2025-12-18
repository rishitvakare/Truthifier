import { NextResponse } from 'next/server';

interface AuditEntry {
  id: string;
  status: 'FLAGGED' | 'CLEAN';
  reason: string;
  originalResponse: string; // Added to support comparison view
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
      let reason = 'Verified compliant.';
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

      // Constraint Checking Logic
      if (responseText.includes('refund')) {
        const daysMatch = responseText.match(/(\d+)\s*days/);
        const daysClaimed = daysMatch ? parseInt(daysMatch[1]) : 0;
        if (daysClaimed > 14 || responseText.includes('30 days')) {
          status = 'FLAGGED';
          riskLevel = 'HIGH';
          reason = `Policy Violation: Offered ${daysClaimed || 'unauthorized'} day refund (Limit: 14 days).`;
        }
      }

      if (status === 'CLEAN' && responseText.includes('discount')) {
        if (responseText.includes('25%')) {
          status = 'FLAGGED';
          riskLevel = 'MEDIUM';
          reason = "Review Required: 25% discount threshold requires manual VP override.";
        }
      }

      // Ensure your mapping includes:
      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status,
        reason,
        originalResponse: log.response, // CRITICAL for Comparison View
        riskLevel
      };
    });

    const issues = detailedResults.filter((r: AuditEntry) => r.status === 'FLAGGED').length;
    const score = logs.length > 0 ? Math.max(0, 100 - Math.round((issues / logs.length) * 100)) : 100;

    return NextResponse.json({ score, totalLogs: logs.length, issues, detailedResults });
  } catch (error) {
    return NextResponse.json({ error: "Protocol Error" }, { status: 500 });
  }
}