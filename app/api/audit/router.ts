import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Extract the file from the incoming FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. Read the file content as text using Web APIs
    const text = await file.text();
    let logs;
    
    try {
      logs = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON format in file" }, { status: 400 });
    }

    // 3. Define audit logic (Risky Keyword Detection)
    const riskyKeywords = ['refund', 'discount', 'free', 'guarantee', 'cancel', 'promise'];
    let issuesFound = 0;

    // 4. Map through logs to identify risks
    const detailedResults = logs.map((log: any) => {
      const responseText = log.response || "";
      const isRisk = riskyKeywords.some(word => responseText.toLowerCase().includes(word));
      
      if (isRisk) issuesFound++;
      
      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status: isRisk ? 'FLAGGED' : 'CLEAN',
        reason: isRisk 
          ? `Potential Hallucination: Found unverified claim involving '${riskyKeywords.find(w => responseText.toLowerCase().includes(w))}'` 
          : 'Compliant'
      };
    });

    // 5. Calculate final score and return JSON
    const totalLogs = logs.length;
    const score = totalLogs > 0 ? Math.max(0, 100 - Math.round((issuesFound / totalLogs) * 100)) : 100;

    return NextResponse.json({
      score,
      totalLogs,
      issues: issuesFound,
      detailedResults
    });

  } catch (error) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: "Internal Server Error during audit" }, { status: 500 });
  }
}