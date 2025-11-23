import { SessionState } from '../domain/SessionState';

const DIFFICULTY_WEIGHT: Record<SessionState['difficulty'], number> = {
  A1: 1,
  A2: 1.5,
  B1: 2,
  B2: 2.5,
  C1: 3,
  C2: 3.5, // give C2 a real bump
};

export function updateGamification(
  session: SessionState,
  difficulty: SessionState['difficulty']
) {
  const baseXP = 10;
  const weight = DIFFICULTY_WEIGHT[difficulty];
  session.addXP(Math.round(baseXP * weight));
}
