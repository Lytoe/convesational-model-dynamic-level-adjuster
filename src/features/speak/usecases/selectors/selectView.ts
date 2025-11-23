import { SessionState } from '../../domain/SessionState';
import type { SessionViewDTO } from '../../models/dto/SessionViewDTO';

export function toViewDTO(s: SessionState): SessionViewDTO {
  const latestAi = selectLatestAiMessage(s);
  const suggestions: [string,string] | [] = s.hint && s.hint.responseA
    ? [s.hint.responseA, s.hint.responseB] : [];

  return {
    scenarioId: s.scenarioId,
    level: s.difficulty,
    turn: s.currentTurn,
    isComplete: s.isComplete,
    messages: s.messages.map(m => ({
      id: (m as any).id,
      role: m.sender === 'ai' ? 'ai' : 'user',
      part1: (m as any).textPart1 || '',
      part2: (m as any).textPart2 || undefined,
      timestamp: (m as any).timestamp
    })),
    latest: {
      corrections: (latestAi && (latestAi as any).corrections) || [],
      keyPhrases: (latestAi && (latestAi as any).keyPhrases) || [],
      suggestions,
      reasoning: s.hint?.reasoning || undefined
    },
    loading: false
  };
}

function selectLatestAiMessage(s: SessionState) {
  for (let i = s.messages.length - 1; i >= 0; i--) {
    if (s.messages[i].sender === 'ai') return s.messages[i] as any;
  }
  return null;
}
