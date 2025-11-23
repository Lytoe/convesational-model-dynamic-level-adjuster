const MOCK_MODE = false;

import { ILlmClient } from '../../ports/ILlmClient';
// Remove import if LlmTurnDTO.ts no longer exists
// import { LlmTurnDTO } from '../../models/dto/LlmTurnDTO';
import { buildPrompt } from './buildPrompt';
import { validateLlmOutput, LlmTurnDTO } from './parseAndValidate'; // Use type defined in parseAndValidate.ts

const API_URL = '/api/gemini';

export class GeminiClient implements ILlmClient {
  async generateTurn(input: {
    userText: string;
    scenario: string;
    history: Array<{ role: 'user' | 'ai'; text: string }>;
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
        newLevel: null,
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

    // Make sure 'result' is returned and in expected format
    return validateLlmOutput(data.result);
  }
}
