import { SessionState } from '../../domain/SessionState';
export function selectLatestAiMessage(s: SessionState) {
  for (let i = s.messages.length - 1; i >= 0; i--) {
    if (s.messages[i].sender === 'ai') return s.messages[i] as any;
  }
  return null;
}
