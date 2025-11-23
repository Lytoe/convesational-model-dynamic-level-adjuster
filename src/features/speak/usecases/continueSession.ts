import { SessionState } from '../domain/SessionState';
import { Message } from '../domain/Message';
// ⛔ removed: adjustDifficulty
import { updateGamification } from './updateGamification';

import { ILlmClient } from '@/features/speak/ports/ILlmClient';
import { GeminiClient } from '@/features/speak/infra/llm/GeminiClient';

import { scoreTurn } from '@/features/speak/usecases/level/scoreTurn';
import { decide } from '@/features/speak/usecases/level/adjuster';


import type { SessionViewDTO } from '../models/dto/SessionViewDTO';
import { toViewDTO } from './selectors/selectView';

// Keep class prototype when returning updated state
function cloneSession(session: SessionState): SessionState {
  return Object.assign(
    Object.create(Object.getPrototypeOf(session)),
    session,
    { messages: [...session.messages], notes: [...session.notes] }
  );
}

// Port client (DI later if you want)
const llmClient: ILlmClient = new GeminiClient();

export type ContinueOpts = {
  userId?: string;
  hintUsed?: boolean;          // from UI (💡 button)
  translationUsed?: boolean;   // set true if user tapped Translate before sending
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
    console.log('[continueSession] Max turns reached. Ending session.');
    session.isComplete = true;
    const state = cloneSession(session);
    return { state, view: toViewDTO(state) };
  }

  // Add user message + latency
  const now = Date.now();
  const userMsg = new Message(now.toString(), 'user', userInput);
  session.addMessage(userMsg);
  console.log('[continueSession] Added User Message:', userMsg);

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

  // Keep previous hint to detect follow-through
  const previousHint = session.hint;

  // --- Call LLM via port ---
  const dto: LlmTurnDTO = await llmClient.generateTurn({
    userText: userInput,
    scenario: session.scenarioId || 'Conversation libre',
    level: session.difficulty,
    history,
  });

  const { aiReply, corrections, hint, keyPhrases } = dto;

  // Back-compat suggestions[] for current message (UI will move to view.latest)
  const suggestions = [hint.responses[0], hint.responses[1], hint.reasoning].filter(Boolean);

  // Update session.hint (source of truth for selectors/view)
  session.hint = suggestions.length >= 3
    ? { responseA: suggestions[0], responseB: suggestions[1], reasoning: suggestions[2] }
    : null;

  // Add AI message
  const aiMsg = new Message(
    Date.now().toString(),
    'ai',
    aiReply?.part1 || '',
    aiReply?.part2 || '',
    undefined,
    corrections || [],
    suggestions || [],
    keyPhrases || []
  );
  session.addMessage(aiMsg);
  session.aiLastMessageAt = aiMsg.timestamp;
  console.log('[continueSession] Added AI Message with structured feedback:', aiMsg);

  // --- Level v2 (EMA + decision, now AUTHORITATIVE) ---
  const lastLatency = session.latencies.at(-1);
  const userText = `${userMsg.textPart1 ?? ''} ${userMsg.textPart2 ?? ''}`.trim();

  const followThrough =
    !!previousHint &&
    !!userText &&
    [previousHint.responseA, previousHint.responseB]
      .filter(Boolean)
      .some((p) => userText.toLowerCase().includes(String(p).toLowerCase()));

  const hintUsed = Boolean(opts?.hintUsed) || Boolean(followThrough);
  const translationUsed = Boolean(opts?.translationUsed);

  const { score, fastTrack } = scoreTurn({
    session,
    userText,
    dto,
    latency: lastLatency,
    hintUsed,
    translationUsed
  });

  // EMA update — smoother (alpha = 0.20)
  session.emaPerformance = Number((0.8 * session.emaPerformance + 0.2 * score).toFixed(4));
  session.emaHistory.push(session.emaPerformance);
  if (session.emaHistory.length > 5) session.emaHistory.shift();

  const decision = decide({
    current: session.difficulty,
    emaHistory: session.emaHistory,
    llmNew: dto.newLevel,                // may be null (by design)
    modelGuess: dto.modelUserLevelGuess, // optional
    lastChangeTurn: session.lastLevelChangeTurn,
    currentTurn: session.currentTurn,
    fastTrack,                           // NEW
  });

  // Apply decision to session.difficulty (v2 is authoritative)
  const ladder = ['A1','A2','B1','B2','C1','C2'] as const;
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

  // XP / gamification (keep)
  updateGamification(session, session.difficulty);

  // One concise line that’s easy to grep
  console.log(
    `[level] curr:${oldLevel} → ${session.difficulty} ` +
    `llm:${dto.newLevel ?? '∅'} guess:${dto.modelUserLevelGuess ?? '∅'} ` +
    `ema:${session.emaHistory.map(v => v.toFixed(2)).join('→')} decision:${decision} applied:${applied} fastTrack:${fastTrack ? 'yes' : 'no'}`
  );

  console.log('[continueSession] Updated Session State (after v2 apply):', JSON.stringify(session, null, 2));

  // Persist (optional)
  if (opts?.userId) {
    console.log(`[continueSession] Logging session for user: ${opts.userId}`);
    await logSession(opts.userId, session);
  }

  console.log('[continueSession] Turn completed.');
  const state = cloneSession(session);
  const view = toViewDTO(state);
  return { state, view };
}
