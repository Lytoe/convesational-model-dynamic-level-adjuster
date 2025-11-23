// src/features/speak/domain/Scenario.ts
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export class Scenario {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public difficulty?: Level,         // ← optional now
    public tags: string[] = [],
    public persona: string = '',
    public promptTemplate: string = '',
    public predefinedSteps: string[] = []
  ) {}
}
