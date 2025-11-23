import { playTTS } from '../infra/ttsAdapter';
import styles from '../styles/KeyPhrasesPanel.module.css';

export default function KeyPhrasesPanel({ keyPhrases }: { keyPhrases: string[] }) {
  if (!keyPhrases || keyPhrases.length === 0) return null;

  return (
    <div className={styles.panel}>
      <h4 className={styles.title}>📌 Phrases clés</h4>
      <ul className={styles.list}>
        {keyPhrases.map((phrase, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.phrase}>{phrase}</span>
            <button className={styles.ttsButton} onClick={() => playTTS(phrase)}>
              ▶
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
