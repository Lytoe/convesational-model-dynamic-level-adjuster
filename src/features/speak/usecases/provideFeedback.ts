import { Feedback } from '../domain/Feedback';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function provideFeedback(userInput: string, targetLevel: 'A1' | 'A2' | 'B1' | 'B2'): Promise<Feedback> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const prompt = `
  Corrige cette phrase pour qu'elle soit naturelle en français de niveau ${targetLevel}: "${userInput}".
  Fournis un JSON: { "correctedText": "...", "tips": ["..."], "score": 0-10 }.
  `;
  const response = await model.generateContent(prompt);
  const text = response.response.text();

  try {
    const data = JSON.parse(text);
    return new Feedback(data.correctedText, data.tips || [], data.score || 5, targetLevel);
  } catch {
    return new Feedback(userInput, ["Correction indisponible."], 5, targetLevel);
  }
}
