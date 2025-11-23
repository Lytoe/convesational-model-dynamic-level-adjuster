const MOCK_MODE = false;

import { ILlmClient } from '../../ports/ILlmClient';
import { buildPrompt } from './buildPrompt';
import { validateLlmOutput, LlmTurnDTO } from './parseAndValidate';

const API_URL = '/api/gemini';

// Helper: Coerce newLevel to "B1" | null
function asB1OrNull(value: "B1" | null | undefined): "B1" | null {
  return value === "B1" ? "B1" : null;
}

export class GeminiClient implements ILlmClient {
  async generateTurn(input: {
    userText: string;
    scenario: string;
    level: "B1";
    history: Array<{ role: 'user' | 'ai'; text: string }>;
    passcode: string;
  }): Promise<LlmTurnDTO> {
    // ---- MOCK MODE ----
    if (MOCK_MODE) {
      return {
        aiReply: {
          part1: "Ceci est une réponse générée (mock) !",
          part2: "Tape encore ton message pour voir des retours différents."
        },
        corrections: [],
        hint: {
          responses: [
            "Essaie de répéter une phrase dans la scène.",
            "Voici une autre phrase de test."
          ],
          reasoning: "Ceci est un retour de test."
        },
        keyPhrases: ["mock", "chat", "test"],
        newLevel: null, // mock always returns null/newLevel (or "B1" only)
        modelUserLevelGuess: "B1"
      };
    }

    // ---- NORMAL LOGIC ----
    const prompt = buildPrompt({
      ...input,
      level: 'B1' // Or your desired CEFR level
    });

    console.log('[GeminiClient] Calling /api/gemini with prompt:', prompt);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
      }),
    });

    console.log('[GeminiClient] /api/gemini response status:', response.status);

    const data = await response.json();

    console.log('[GeminiClient] /api/gemini raw data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      const errorMsg = data?.error || 'Gemini API error';
      throw new Error(errorMsg);
    }

    // --- Cast and validate result for types ---
    const validated = validateLlmOutput(data.result);

    // Fix: always narrow newLevel to "B1" | null!
    return {
      ...validated,
      newLevel: asB1OrNull(validated.newLevel),
      modelUserLevelGuess: validated.modelUserLevelGuess === "B1" ? "B1" : undefined,
    };
  }
}
