import { SessionState } from '../domain/SessionState';
import { scenarioRepository } from '../infra/scenarioRepository';
import { Message } from '../domain/Message';
import { buildStartPrompt } from '../prompts/buildStartPrompt';
import { ILlmClient } from '@/features/speak/ports/ILlmClient';
import { GeminiClient } from '@/features/speak/infra/llm/GeminiClient';

// LLM client (simple local composition; DI later if you want)
const llmClient: ILlmClient = new GeminiClient();

type Phase = 'context' | 'persona' | 'reply';
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type StartSessionOptions = { signal?: AbortSignal; onPhase?: (p: Phase) => void };

export async function startSession(
  scenarioId: string,
  userDifficulty: CEFR,
  opts: StartSessionOptions = {}
) {
  const onPhase = opts.onPhase ?? (() => {});
  const signal = opts.signal;

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const abortPromise: Promise<never> | null = signal
    ? new Promise((_, reject) =>
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')), { once: true })
      )
    : null;

  console.log('[startSession] Starting session for scenario:', scenarioId);

  onPhase('context');
  const scenario = scenarioRepository.find((s) => s.id === scenarioId);
  if (!scenario) throw new Error(`[startSession] Scenario not found: ${scenarioId}`);

  const difficulty = userDifficulty;
  console.log('[startSession] Using difficulty:', difficulty);

  const session = new SessionState(
    scenario.id,
    [],
    0,
    difficulty,
    0,
    0
  );
  session.notes = [];
  console.log('[startSession] New Session initialized:', JSON.stringify(session, null, 2));

  onPhase('persona');
  const prompt = buildStartPrompt(difficulty, scenario.title);
  console.log('[startSession] Opening prompt for LLM (redacted).');

  onPhase('reply');

  // First turn: send prompt as if user spoke it; empty history
  const llmCall = llmClient.generateTurn({
    userText: prompt,
    scenario: scenario.title,
    level: difficulty,
    history: []
  });

  // Make start cancelable: race LLM vs abort
  const dto = (abortPromise ? await Promise.race([llmCall, abortPromise]) : await llmCall) as Awaited<
    ReturnType<typeof llmClient.generateTurn>
  >;

  const { aiReply, hint } = dto;

  // Build suggestions[] from hint
  const suggestions = [hint.responses[0], hint.responses[1], hint.reasoning].filter(Boolean);

  // Extract hint into session if available
  if (suggestions.length >= 3) {
    session.hint = {
      responseA: suggestions[0],
      responseB: suggestions[1],
      reasoning: suggestions[2],
    };
  }

  console.log('[startSession] Opening AI message received.');

  const openingMessage = new Message(
    Date.now().toString(),
    'ai',
    aiReply.part1,
    aiReply.part2
  );
  session.addMessage(openingMessage);
  session.aiLastMessageAt = openingMessage.timestamp;

  return { session, scenario };
}
