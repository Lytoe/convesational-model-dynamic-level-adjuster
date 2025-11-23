import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  // ==== AUTHENTICATION GUARD ====
  const cookieHeader = req.headers.get('cookie');
  const isLoggedIn = cookieHeader && cookieHeader.includes('user=');
  if (!isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized: login required" }, { status: 401 });
  }
  // ==============================

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  console.log('[gemini/route] GEMINI_API_KEY present:', !!GEMINI_API_KEY);
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key missing" }, { status: 500 });
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  // Translation branch: detect translation request by 'text' and 'targetLang'.
  if (data.text && data.targetLang) {
    console.log('[gemini/route] Translation requested:', data.text, data.targetLang);
    const prompt = `Traduis en ${data.targetLang} la phrase suivante sans explication, uniquement le texte traduit : "${data.text}"`;
    try {
      const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
      const result = await model.generateContent(prompt);
      const translated = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return NextResponse.json({ translated: translated.trim() }, { status: 200 });
    } catch (err: any) {
      console.error('[gemini/route] Translation failure:', err?.message || err);
      return NextResponse.json(
        { error: err?.message || "Translation Gemini call failed" },
        { status: 500 }
      );
    }
  }

  // Conversational branch: keep your existing logic
  if (!data.prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }
  console.log('[gemini/route] Incoming prompt:', data.prompt);

  try {
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(data.prompt);
    console.log('[gemini/route] Gemini raw result:', JSON.stringify(result, null, 2));

    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('[gemini/route] Gemini JSON block:', text);

    let jsonString = text
      ? text
        .replace(/```json\s*/i, "") 
        .replace(/```/g, "")
        .trim()
      : "";

    let structuredResult;
    try {
      structuredResult = JSON.parse(jsonString);
    } catch (e) {
      console.error('[gemini/route] Failed to parse Gemini response:', e, jsonString);
      return NextResponse.json({ error: "Gemini did not produce valid JSON" }, { status: 500 });
    }

    function mapCorrections(corrections: any[] = []) {
      return corrections.map(c => ({
        userText: c.userText ?? c.original ?? "",
        correction: c.correction ?? c.corrected ?? "",
        explanation: c.explanation ?? "",
        severity: c.severity ?? "minor",
      }));
    }

    const mapped = {
      aiReply: {
        part1: structuredResult.response || "",
        part2: ""
      },
      corrections: mapCorrections(structuredResult.corrections),
      hint: {
        responses: structuredResult.possibleUserResponses || ["", ""],
        reasoning: structuredResult.reasoning || ""
      },
      keyPhrases: structuredResult.keyPhrases || [],
      newLevel: structuredResult.newLevel ?? null,
      modelUserLevelGuess: structuredResult.modelUserLevelGuess ?? null
    };

    return NextResponse.json({ result: mapped }, { status: 200 });
  } catch (err: any) {
    console.error('[gemini/route] Gemini call failed:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Gemini call failed" },
      { status: 500 }
    );
  }
}
