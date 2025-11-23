// Remove the import for LlmTurnDTO if the file no longer exists.
// import type { LlmTurnDTO } from '../../models/dto/LlmTurnDTO';

// Define the minimal LlmTurnDTO type inline here
export type LlmTurnDTO = {
  aiReply: { part1: string; part2: string };
  corrections: Array<{
    userText: string;
    correction: string;
    explanation: string;
    severity: 'minor' | 'major';
  }>;
  hint: { responses: [string, string]; reasoning: string };
  keyPhrases: string[];
  newLevel: "B1" | null;
  modelUserLevelGuess?: "B1" | null;
};

export function cleanToJsonSlice(text: string): string {
  const t = text.replace(/``````/g, '').trim();
  const s = t.indexOf('{'); const e = t.lastIndexOf('}');
  return (s >= 0 && e > s) ? t.slice(s, e + 1) : t;
}

export function validateLlmOutput(raw: any): LlmTurnDTO {
  const S = (v: any) => typeof v === 'string' ? v.trim() : '';
  const cap = (s: string, n: number) => s.length > n ? s.slice(0, n) : s;

  const aiReply = {
    part1: cap(S(raw?.aiReply?.part1), 400),
    part2: cap(S(raw?.aiReply?.part2), 400),
  };

  const corrections = Array.isArray(raw?.corrections)
    ? raw.corrections.map((c: any) => ({
        userText: cap(S(c?.userText), 200),
        correction: cap(S(c?.correction), 200),
        explanation: cap(S(c?.explanation), 300),
        severity: c?.severity === 'major' ? 'major' : 'minor',
      }))
    : [];

  const modelUserLevelGuess = (() => {
    const lvl = raw?.modelUserLevelGuess;
    return (['A1','A2','B1','B2','C1','C2'] as const).includes(lvl) ? lvl : undefined;
  })();

  const respA = cap(S(raw?.hint?.responses?.[0] ?? raw?.suggestions?.[0]), 120);
  const respB = cap(S(raw?.hint?.responses?.[1] ?? raw?.suggestions?.[1]), 120);
  const reasoning = cap(S(raw?.hint?.reasoning ?? raw?.suggestions?.[2]), 220);
  const hint = { responses: [respA, respB] as [string, string], reasoning };

  const keyPhrases = (Array.isArray(raw?.keyPhrases) ? raw.keyPhrases : [])
    .filter((x: any) => typeof x === 'string')
    .map((x: string) => cap(x.trim(), 80))
    .slice(0, 2);

  const lvl = raw?.newLevel;
  const newLevel =
    (['A1','A2','B1','B2','C1','C2'] as const).includes(lvl) ? lvl : null;

  // Hard failure: no reply at all → safe fallback turn
  if (!aiReply.part1 && !aiReply.part2) {
    return {
      aiReply: { part1: 'Désolé, peux-tu reformuler ?', part2: '' },
      corrections: [],
      hint: { responses: ['',''], reasoning: '' },
      keyPhrases: [],
      newLevel: null,
      modelUserLevelGuess: null,
    };
  }

  return { aiReply, corrections, hint, keyPhrases, newLevel, modelUserLevelGuess };
}
