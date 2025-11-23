import AvatarCoach from './AvatarCoach';

export default function ProgressPanel({ scenario, currentTurn, maxTurns, xp, streak }: any) {
  return (
    <div style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <AvatarCoach />
        <div>
          <h3>{scenario.title}</h3>
          <p>Tour {currentTurn}/{maxTurns}</p>
        </div>
      </div>
      <div>
        <p>XP: {xp}</p>
        <p>🔥 Streak: {streak}</p>
      </div>
    </div>
  );
}
