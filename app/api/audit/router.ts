import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Use .text() to read the file; this avoids the 'Buffer' error on Vercel
    const text = await file.text();
    const logs = JSON.parse(text);

    const riskyKeywords = ['refund', 'discount', 'free', 'guarantee'];
    const detailedResults = logs.map((log: any) => {
      const isRisk = riskyKeywords.some(word => 
        log.response?.toLowerCase().includes(word)
      );
      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status: isRisk ? 'FLAGGED' : 'CLEAN',
        reason: isRisk ? 'Potential Hallucination detected' : 'Compliant'
      };
    });

    return NextResponse.json({
      score: Math.max(0, 100 - (detailedResults.filter((r: any) => r.status === 'FLAGGED').length * 10)),
      totalLogs: logs.length,
      issues: detailedResults.filter((r: any) => r.status === 'FLAGGED').length,
      detailedResults
    });
  } catch (error) {
    // If anything fails, it triggers your frontend alert
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}