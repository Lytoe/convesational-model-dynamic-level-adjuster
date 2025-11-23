export interface ILlmClient {
  generateTurn(input: {
    userText: string;
    scenario: string;
    level: "B1";
    history: Array<{ role: 'user' | 'ai'; text: string }>;
    passcode: string;
  }): Promise<{
    aiReply: { part1: string; part2: string };
    corrections: {
      userText: string;
      correction: string;
      explanation: string;
      severity?: "minor" | "major";
    }[];
    hint: { responses: [string, string]; reasoning: string };
    keyPhrases: string[];
    newLevel: "B1" | null;
    modelUserLevelGuess?: "B1";
  }>;
}
