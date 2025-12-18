import { NextResponse } from 'next/server';

/**
 * AI Truthifier - Audit API Route
 * Processes a JSON log file and compares it against a provided Truth Source.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // 1. Extract the file and the Truth Source documentation
    const file = formData.get('file') as File;
    const truthSource = (formData.get('truthSource') as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. Read the file content as text using Web APIs to avoid Buffer errors
    const text = await file.text();
    let logs;
    
    try {
      logs = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON format in file" }, { status: 400 });
    }

    if (!Array.isArray(logs)) {
      return NextResponse.json({ error: "File must be a JSON array of objects" }, { status: 400 });
    }

    // 3. Define Audit Logic (Keywords and Contextual Comparison)
    const riskyKeywords = ['refund', 'discount', 'free', 'guarantee', 'cancel', 'promise'];
    let issuesFound = 0;

    const detailedResults = logs.map((log: any) => {
      const responseText = (log.response || "").toLowerCase();
      
      // Check for predefined high-risk keywords
      const hasRiskyKeyword = riskyKeywords.some(word => responseText.includes(word));
      
      // Contextual check: Does the response mention something NOT in the truth source?
      // (Simple demo logic: If truthSource exists, we check if key phrases are missing from it)
      let contradiction = false;
      if (truthSource.length > 0 && hasRiskyKeyword) {
        const foundInSource = riskyKeywords.filter(word => responseText.includes(word))
                                           .every(word => truthSource.toLowerCase().includes(word));
        if (!foundInSource) contradiction = true;
      }

      const isRisk = hasRiskyKeyword || contradiction;
      if (isRisk) issuesFound++;

      return {
        id: log.id || Math.random().toString(36).substr(2, 5),
        status: isRisk ? 'FLAGGED' : 'CLEAN',
        reason: isRisk 
          ? contradiction 
            ? "Contradicts Truth Source: Claim not found in documentation." 
            : `Potential Risk: Unverified mention of '${riskyKeywords.find(w => responseText.includes(w))}'.`
          : 'Compliant with documentation.'
      };
    });

    // 4. Calculate Final Metrics
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