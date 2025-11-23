const ladder = ['A1','A2','B1','B2','C1','C2'] as const;
const idx = (l: string) => Math.max(0, ladder.indexOf(l as any));

/**
 * Policy v2.2
 *  - Grace: no changes before turn 3.
 *  - Cadence: evaluate every 3rd turn (3,6,9,12,15...).
 *  - Neutral band: hold if EMA in [0.45, 0.60].
 *  - Promote: last two EMA ≥ 0.68 AND (LLM newLevel >= current OR modelGuess > current).
 *  - Demote: last two EMA ≤ 0.38.
 *  - Fast-track up (bypass cadence): if fastTrack==true AND (guessUp || llmUp), respect cooldown and promote.
 *  - Cooldown: ≥ 2 turns between changes.
 */
export function decide(opts: {
  current: string;
  emaHistory: number[];
  llmNew?: string | null;
  modelGuess?: string;
  lastChangeTurn: number | null;
  currentTurn: number;
  fastTrack?: boolean;
}): 'up' | 'down' | 'hold' {
  const { current, emaHistory, llmNew, modelGuess, lastChangeTurn, currentTurn, fastTrack } = opts;

  // Grace
  if (currentTurn < 3) return 'hold';

  const h = emaHistory.slice(-2);
  const last = h.at(-1) ?? 0.5;
  const prev = h.at(-2) ?? last;

  const cool = lastChangeTurn == null || (currentTurn - lastChangeTurn) >= 2;
  const llmUp   = !!llmNew     && idx(llmNew)    >= idx(current);
  const guessUp = !!modelGuess && idx(modelGuess) >  idx(current);

  // 🚀 Fast-track (skip cadence gate)
  if (cool && fastTrack && (llmUp || guessUp)) return 'up';

  // Cadence gate
  if (currentTurn % 3 !== 0) return 'hold';

  // Neutral band
  if (last >= 0.48 && last <= 0.55) return 'hold';

  const hi2 = h.length >= 2 && h.every(v => v >= 0.60);
  const lo2 = h.length >= 2 && h.every(v => v <= 0.38);

  if (cool && hi2 && (llmUp || guessUp)) return 'up';
  if (cool && lo2) return 'down';

  return 'hold';
}
