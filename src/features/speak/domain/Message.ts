export class Message {
  constructor(
    public id: string,
    public sender: 'user' | 'ai',
    public textPart1: string,
    public textPart2?: string,
    public audioUrl?: string,
    public corrections?: { userText: string; correction: string; explanation: string }[],
    public suggestions?: string[],
    public keyPhrases?: string[],
    public timestamp: number = Date.now()
  ) {}
}
