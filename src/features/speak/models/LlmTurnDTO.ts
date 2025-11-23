export type LlmTurnDTO = {
  aiReply: { part1: string; part2: string };
  corrections: { userText: string; correction: string; explanation: string; severity?: "minor" | "major" }[];
  hint: { responses: [string, string]; reasoning: string };
  keyPhrases: string[];
  newLevel: "B1" | null;               // <-- ONLY "B1" or null!
  modelUserLevelGuess?: "B1";
};
