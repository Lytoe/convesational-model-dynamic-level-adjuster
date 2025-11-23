import { useMemo } from 'react';
import styles from '../../styles/ConfidenceSlider.module.css';

const LEVELS = ['A1','A2','B1','B2','C1','C2'] as const;
type Level = typeof LEVELS[number];

export default function ConfidenceSlider({
  valueIndex, onChange, showTicks = true
}: { valueIndex: number; onChange: (idx:number)=>void; showTicks?: boolean }) {
  const pct = useMemo(() => (valueIndex / (LEVELS.length - 1)) * 100, [valueIndex]);
  const label = LEVELS[valueIndex];
  const labelColor = {
    A1:'var(--cefr-a1)', A2:'var(--cefr-a2)', B1:'var(--cefr-b1)',
    B2:'var(--cefr-b2)', C1:'var(--cefr-c1)', C2:'var(--cefr-c2)'
  }[label];

  return (
    <div className={styles.wrap} style={{ ['--pct' as any]: `${pct}%` }}>
      <input
        className={styles.range}
        type="range"
        min={0}
        max={LEVELS.length-1}
        step={1}
        value={valueIndex}
        aria-label="Niveau CEFR"
        onChange={(e)=>onChange(Number(e.target.value))}
      />
      {showTicks && (
        <div className={styles.ticks} aria-hidden>
          {LEVELS.map((lv, i) => (
            <span key={lv} className={styles.tick} data-active={i<=valueIndex}>{lv}</span>
          ))}
        </div>
      )}
      <div className={styles.bubble} style={{ background: labelColor }}>
        <strong>{label}</strong>
      </div>
    </div>
  );
}
