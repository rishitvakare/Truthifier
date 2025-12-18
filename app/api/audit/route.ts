import { NextResponse } from 'next/server';

// Define an interface for our audit results to fix TypeScript errors
interface AuditResult {
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

    const riskyKeywords = ['refund', 'discount', 'free', 'guarantee', 'shipping', 'promise'];
    
    // Explicitly type the mapped array to avoid 'any' errors
    const detailedResults: AuditResult[] = logs.map((log: any) => {
      const responseText = (log.response || "").toLowerCase();
      const foundKeywords = riskyKeywords.filter(word => responseText.includes(word));
      
      let status: 'FLAGGED' | 'CLEAN' = 'CLEAN';
      let reason = 'Verified against documentation.';

      if (foundKeywords.length > 0) {
        // If the word isn't in the truth source, we flag it
        const allWordsVerified = truthSource.length > 0 && 
          foundKeywords.every(word => truthSource.includes(word));
        
        if (!allWordsVerified) {
          status = 'FLAGGED';
          const unverifiedWord = foundKeywords.find(word => !truthSource.includes(word)) || foundKeywords[0];
          reason = `Potential Risk: Unverified mention of '${unverifiedWord}'.`;
        } else {
          status = 'CLEAN';
          reason = `Verified: AI reference to '${foundKeywords.join(', ')}' matches policy.`;
        }
      }

      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status,
        reason
      };
    });

    // Explicitly typing 'r' as AuditResult fixes the error in image_e6d8b1.png
    const issues = detailedResults.filter((r: AuditResult) => r.status === 'FLAGGED').length;
    
    const score = logs.length > 0 
      ? Math.max(0, 100 - Math.round((issues / logs.length) * 100)) 
      : 100;

    return NextResponse.json({
      score,
      totalLogs: logs.length,
      issues,
      detailedResults
    });
  } catch (error) {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}