import { Message } from './Message';

export interface Note {
  type: 'alternative' | 'vocabulary' | 'grammar';
  content: string;
  example?: string;
}
export type Hint = {
  responseA: string;
  responseB: string;
  reasoning: string;
};

export class SessionState {
  constructor(
    public scenarioId: string,
    public messages: Message[] = [],
    public currentTurn: number = 0,
    public difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
    public xp: number = 0,
    public streak: number = 0,
    public hint: Hint | null = null,
    public isComplete: boolean = false,
    public maxTurns: number = 15,
    public createdAt: number = Date.now(),
    public notes: Note[] = [],
    public lastLevelChange: { old: string; new: string } | null = null,
    public emaPerformance: number = 0.5,
    public lastLevelChangeTurn: number | null = null,
    public aiLastMessageAt: number | null = null,
    public latencies: number[] = [],
    public emaHistory: number[] = [], // keep last 5
  ) {}

  addMessage(message: Message) {
    this.messages.push(message);
    this.currentTurn++;
    if (message.sender === 'ai') this.aiLastMessageAt = message.timestamp;
    if (message.sender === 'user' && this.aiLastMessageAt) {
      const d = Math.max(0, message.timestamp - this.aiLastMessageAt);
      this.latencies.push(d); if (this.latencies.length > 20) this.latencies.shift();
    }
    if (this.currentTurn >= this.maxTurns) this.isComplete = true;
  }

  addXP(points: number) {
    this.xp += points;
  }

  markComplete() {
    this.isComplete = true;
  }
}
