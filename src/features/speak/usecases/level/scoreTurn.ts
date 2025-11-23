import { expectedBand, p90, tokenCount, usedAnyKeyPhrase } from './heuristics';
import type { SessionState } from '../../domain/SessionState';

const GRACE_MS = 3500;
const MIN_LAT_SAMPLES = 4;

export function scoreTurn(opts: {
  session: SessionState;
  userText: string;
  latency: number | undefined;
  hintUsed: boolean;
  translationUsed?: boolean;
}): { score: number; fastTrack: boolean } {
  let s = 0.5;

  const userTokens = Math.max(1, tokenCount(opts.userText));
  const corr =[];
  const density = corr.length / userTokens;

  // Softer penalties
  s -= 0.20 * Math.min(1, density / 0.08);
  if (corr.some(c => c.severity === 'major')) s -= 0.10;
  if (opts.hintUsed) s -= 0.05;
  if (opts.translationUsed) s -= 0.05;

  // Latency fairness
  const norm = (ms: number) => Math.max(0, ms - GRACE_MS);
  const normLatencies = opts.session.latencies.map(norm);
  const effLatency = opts.latency != null ? norm(opts.latency) : undefined;
  if (effLatency != null && opts.session.latencies.length >= MIN_LAT_SAMPLES) {
    const p90lat = p90(normLatencies);
    if (effLatency > p90lat) s -= 0.10;
  }

  // Targeted language
  if (usedAnyKeyPhrase(opts.session.hint, opts.userText)) s += 0.10;

  // Length relative to current level band
  const [minL, maxL] = expectedBand(opts.session.difficulty);
  if (userTokens >= minL && userTokens <= maxL) s += 0.12;

  // 🚀 NEW: reward clean “beyond-band” surge
  let fastTrack = false;
  const wayAbove = userTokens >= Math.ceil(2.0 * maxL);
  const above = userTokens >= Math.ceil(1.5 * maxL);
  const clean = density <= 0.04 && !corr.some(c => c.severity === 'major');

  if (wayAbove && clean) {
    s += 0.18;                 // strong bump
    if (corr.length === 0) {
      s = Math.max(s, 0.80);   // floor to show mastery in one turn
      fastTrack = true;        // signal to the decider
    }
  } else if (above && clean) {
    s += 0.12;                 // moderate bump
  }

  const score = Math.max(0, Math.min(1, s));
  return { score, fastTrack };
}
