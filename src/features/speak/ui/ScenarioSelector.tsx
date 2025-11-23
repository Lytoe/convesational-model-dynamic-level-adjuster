import { useMemo, useState } from 'react';
import { scenarioRepository } from '../infra/scenarioRepository';
import { scenarioUi } from './scenarioUiCatalog';
import ScenarioCard from './components/ScenarioCard';
import ConfidenceSlider from './components/ConfidenceSlider';
import styles from '../styles/ScenarioSelector.module.css';

const LEVELS = ['A1','A2','B1','B2','C1','C2'] as const;
const LEVEL_DESC = [
  'Je suis débutant total',
  'Je suis un peu confiant',
  'Je comprends pas mal',
  'Je suis assez à l’aise',
  'Je parle bien',
  'Je maîtrise presque tout',
] as const;

export default function ScenarioSelector({
  onSelect,
}: { onSelect: (scenarioId: string, difficulty: typeof LEVELS[number]) => void }) {

  const [levelIdx, setLevelIdx] = useState(2); // B1 default
  const level = LEVELS[levelIdx];
  const byTitle = useMemo(() => [...scenarioRepository].sort((a,b)=>a.title.localeCompare(b.title)), []);

  return (
    <div className={styles.page}>
      {/* Always-visible level control */}
      <div className={styles.stickyBar} role="region" aria-label="Sélecteur de niveau">
        <div className={styles.levelRow}>
          <span className={styles.levelText}>Niveau global</span>
        </div>
        <ConfidenceSlider valueIndex={levelIdx} onChange={setLevelIdx} showTicks={false}/>
        <div className={styles.levelNote}>
          <strong>{level}</strong> — {LEVEL_DESC[levelIdx]} • S’applique à tous les scénarios
        </div>
      </div>

      <h2 className={styles.h2}>Choisissez un scénario</h2>
      <div className={styles.grid}>
        {byTitle.map(s => (
          <ScenarioCard
            key={s.id}
            title={s.title}
            description={s.description}
            tags={s.tags}
            thumb={scenarioUi[s.id]?.thumb}
            level={level}                     // colored CEFR badge on each card
            onClick={() => onSelect(s.id, level)}
          />
        ))}
      </div>

      {/* removed the duplicate bottom slider block */}
    </div>
  );
}
