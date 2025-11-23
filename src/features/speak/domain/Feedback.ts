export class Feedback {
  constructor(
    public correctedText: string,
    public tips: string[] = [],
    public score: number = 0,
    public cefrEstimate: 'A1' | 'A2' | 'B1' | 'B2' = 'A1',
    public deepFeedback?: string
  ) {}
}
