import styles from '../../styles/LoadingOverlay.module.css';
import { useEffect, useRef } from 'react';

export default function LoadingOverlay({
  phase, onCancel
}: { phase: 'context'|'persona'|'reply'; onCancel: ()=>void }) {
  const live = useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(live.current) live.current.textContent = phase; }, [phase]);
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Initialisation du scénario">
      <div className={styles.box}>
        <div className={styles.spinner}/>

        <h3 className={styles.title}>Préparation du scénario…</h3>
        <ul className={styles.steps}>
          <li data-active={phase==='context'}>Contexte</li>
          <li data-active={phase==='persona'}>Persona</li>
          <li data-active={phase==='reply'}>Première réplique</li>
        </ul>

        <button className={styles.cancel} onClick={onCancel}>Annuler</button>
        <div className={styles.live} aria-live="polite" ref={live}/>
      </div>
    </div>
  );
}
