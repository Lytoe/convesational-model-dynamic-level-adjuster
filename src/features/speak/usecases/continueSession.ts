import { SessionState } from '../domain/SessionState';
import { Message } from '../domain/Message';
import { updateGamification } from './updateGamification';

import { ILlmClient } from '@/features/speak/ports/ILlmClient';
import { GeminiClient } from '@/features/speak/infra/llm/GeminiClient';

import { scoreTurn } from '@/features/speak/usecases/level/scoreTurn';
import { decide } from '@/features/speak/usecases/level/adjuster';

import type { SessionViewDTO } from '../models/dto/SessionViewDTO';
import { toViewDTO } from './selectors/selectView';

// Add/Import your Turn DTO here, or import from 'models/dto/LlmTurnDTO'
export type LlmTurnDTO = {
  aiReply: { part1: string; part2: string };
  corrections: { userText: string; correction: string; explanation: string; severity?: "minor" | "major" }[];
  hint: { responses: [string, string]; reasoning: string };
  keyPhrases: string[];
  newLevel: "B1" | null; // If multiple levels: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null
  modelUserLevelGuess?: "B1"; // Or union type if needed
};

// If not implemented, stub logSession:
async function logSession(userId: string, session: SessionState) {
  // Persist logic here if needed (DB, file, etc.)
  return;
}

// Utility: Deeply clone session object
function cloneSession(session: SessionState): SessionState {
  return Object.assign(
    Object.create(Object.getPrototypeOf(session)),
    session,
    { messages: [...session.messages], notes: [...session.notes] }
  );
}

// DI Port pattern
const llmClient: ILlmClient = new GeminiClient();

export type ContinueOpts = {
  userId?: string;
  hintUsed?: boolean;
  translationUsed?: boolean;
};

export async function continueSession(
  session: SessionState,
  userInput: string,
  opts?: ContinueOpts
): Promise<{ state: SessionState; view: SessionViewDTO }> {
  console.log('[continueSession] Starting new turn...');
  console.log('[continueSession] Current Session State (before):', JSON.stringify(session, null, 2));
  console.log('[continueSession] User Input:', userInput);

  // Cap check
  if (session.currentTurn >= session.maxTurns) {
    session.isComplete = true;
    const state = cloneSession(session);
    return { state, view: toViewDTO(state) };
  }

  // Add user message
  const now = Date.now();
  const userMsg = new Message(now.toString(), 'user', userInput);
  session.addMessage(userMsg);

  // Update latency history
  if (session.aiLastMessageAt) {
    const latency = now - session.aiLastMessageAt;
    const last = session.latencies.at(-1);
    if (last !== latency) {
      session.latencies.push(latency);
      if (session.latencies.length > 30) session.latencies.shift();
    }
  }

  // Short history (last 5)
  type HistoryTurn = { role: 'user' | 'ai'; text: string };
  const history: HistoryTurn[] = session.messages.slice(-5).map((m) => ({
    role: m.sender,
    text: `${m.textPart1 ?? ''} ${m.textPart2 ?? ''}`.trim(),
  }));

  // Save previous hint
  const previousHint = session.hint;

  // --- Call LLM client ---
  const dto: LlmTurnDTO = await llmClient.generateTurn({
    userText: userInput,
    scenario: session.scenarioId || 'Conversation libre',
    level: "B1", // or session.difficulty if using all levels
    history,
    passcode: '' // add if your model requires passcode; otherwise remove
  });

  const { aiReply, corrections, hint, keyPhrases } = dto;

  // Compose suggestions for hint
  const suggestions = [hint.responses[0], hint.responses[1], hint.reasoning].filter(Boolean);

  session.hint = suggestions.length >= 3
    ? { responseA: suggestions[0], responseB: suggestions[1], reasoning: suggestions[2] }
    : null;

  // Add AI message
  const aiMsg = new Message(
    Date.now().toString(),
    'ai',
    aiReply?.part1 ?? '',
    aiReply?.part2 ?? '',
    undefined,
    corrections ?? [],
    suggestions ?? [],
    keyPhrases ?? []
  );
  session.addMessage(aiMsg);
  session.aiLastMessageAt = aiMsg.timestamp;

  // EMA/Level update logic
  const lastLatency = session.latencies.at(-1);
  const userTextForScore = `${userMsg.textPart1 ?? ''} ${userMsg.textPart2 ?? ''}`.trim();
  const followThrough =
    !!previousHint &&
    !!userTextForScore &&
    [previousHint.responseA, previousHint.responseB]
      .filter(Boolean)
      .some((p) => userTextForScore.toLowerCase().includes(String(p).toLowerCase()));

  const hintUsed = Boolean(opts?.hintUsed) || Boolean(followThrough);
  const translationUsed = Boolean(opts?.translationUsed);

  const { score, fastTrack } = scoreTurn({
    session,
    userText: userTextForScore,
    latency: lastLatency,
    hintUsed,
    translationUsed
  });

  // EMA history update
  session.emaPerformance = Number((0.8 * session.emaPerformance + 0.2 * score).toFixed(4));
  session.emaHistory.push(session.emaPerformance);
  if (session.emaHistory.length > 5) session.emaHistory.shift();

  const decision = decide({
    current: session.difficulty,
    emaHistory: session.emaHistory,
    llmNew: dto.newLevel, // null by design if not "B1"
    modelGuess: dto.modelUserLevelGuess,
    lastChangeTurn: session.lastLevelChangeTurn,
    currentTurn: session.currentTurn,
    fastTrack,
  });

  // Level ladder logic
  const ladder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
  const oldLevel = session.difficulty;
  let i = ladder.indexOf(oldLevel);
  if (decision === 'up' && i < ladder.length - 1) i++;
  if (decision === 'down' && i > 0) i--;
  const newLevel = ladder[i];

  let applied: 'up' | 'down' | 'hold' = 'hold';
  if (newLevel !== oldLevel) {
    session.difficulty = newLevel;
    session.lastLevelChange = { old: oldLevel, new: newLevel };
    session.lastLevelChangeTurn = session.currentTurn;
    applied = (ladder.indexOf(newLevel) > ladder.indexOf(oldLevel)) ? 'up' : 'down';
  }

  console.log('[level v2][shadow->applied]', {
    score,
    fastTrack,
    ema: session.emaPerformance,
    decision,
    applied,
    llm: dto.newLevel ?? '∅',
    guess: dto.modelUserLevelGuess ?? '∅',
  });

  updateGamification(session, session.difficulty);

  console.log(
    `[level] curr:${oldLevel} → ${session.difficulty} ` +
    `llm:${dto.newLevel ?? '∅'} guess:${dto.modelUserLevelGuess ?? '∅'} ` +
    `ema:${session.emaHistory.map(v => v.toFixed(2)).join('→')} decision:${decision} applied:${applied} fastTrack:${fastTrack ? 'yes' : 'no'}`
  );

  console.log('[continueSession] Updated Session State (after v2 apply):', JSON.stringify(session, null, 2));

  // Persist, if needed
  if (opts?.userId) {
    console.log(`[continueSession] Logging session for user: ${opts.userId}`);
    await logSession(opts.userId, session);
  }

  console.log('[continueSession] Turn completed.');
  const state = cloneSession(session);
  const view = toViewDTO(state);
  return { state, view };
}
