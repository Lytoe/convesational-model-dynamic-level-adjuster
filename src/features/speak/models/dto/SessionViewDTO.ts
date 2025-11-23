
export interface SessionViewDTO {
  scenarioId: string;

  turn: number;
  isComplete: boolean;

  // Flattened messages for rendering (UI stays dumb)
  messages: Array<{
    id: string;
    role: 'user'|'ai';
    part1: string;
    part2?: string;
    timestamp: number;
  }>;

  // Latest AI feedback bundle (for side panels)
  latest: {
    corrections: Array<{userText:string;correction:string;explanation:string;severity:'minor'|'major'}>;
    keyPhrases: string[];
    suggestions: [string,string] | [];
    reasoning?: string;
  };

  // UX flags
  loading: boolean;
  error?: string;
}
