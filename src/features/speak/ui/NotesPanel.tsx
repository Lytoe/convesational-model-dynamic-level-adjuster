import styles from '../styles/NotesPanel.module.css';
import type { Note } from '../domain/SessionState';
import type { Message } from '../domain/Message';

// Legacy correction type (aggregated mode)
type Correction = { userText: string; correction: string; explanation: string };

export default function NotesPanel({
  notes,
  corrections = [],
  reasoning,
}: {
  notes: Note[];
  corrections?: Correction[];
  reasoning?: string;
}) {
  // 👉 Legacy aggregated “sidebar” mode (kept for reuse).
  // No internal scrolling here — the parent owns scroll.

  const hasContent =
    (notes && notes.length > 0) ||
    (corrections && corrections.length > 0) ||
    Boolean(reasoning);

  if (!hasContent) {
    return (
      <div className={styles.legacyPanel}>
        <h3 className={styles.sectionTitle}>Notes d’apprentissage</h3>
        <div className={styles.empty}>
          Aucune note pour l’instant. Continuez la conversation !
        </div>
      </div>
    );
  }

  // Group notes by type
  const grouped = notes.reduce((acc: Record<string, Note[]>, note) => {
    acc[note.type] = acc[note.type] || [];
    acc[note.type].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  return (
    <div className={styles.legacyPanel}>
      <h3 className={styles.sectionTitle}>Notes d’apprentissage</h3>

      {/* Vocab / Grammar / Alternatives */}
      {Object.entries(grouped).map(([type, group]) => (
        <div key={type} className={styles.section}>
          <h4>
            {type === 'alternative'
              ? 'Formulations alternatives'
              : type === 'vocabulary'
              ? 'Vocabulaire'
              : 'Grammaire'}
          </h4>
          <ul className={styles.notesList}>
            {group.map((note, idx) => (
              <li key={`${type}-${idx}`}>
                <span className={`${styles.badge} ${styles[type]}`}>
                  {type === 'vocabulary'
                    ? '📖 Vocab'
                    : type === 'grammar'
                    ? '⚙️ Grammaire'
                    : '🔁 Alternative'}
                </span>
                <strong>{note.content}</strong>
                {note.example && (
                  <span className={styles.example}> — {note.example}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Corrections */}
      {corrections.length > 0 && (
        <div className={styles.section}>
          <h4>Corrections</h4>
          <ul className={styles.correctionsList}>
            {corrections.map((c, i) => (
              <li key={i}>
                ❌ <span className={styles.wrong}>{c.userText}</span> → ✅{' '}
                <span className={styles.correct}>{c.correction}</span>
                {c.explanation && (
                  <div className={styles.explanation}>{c.explanation}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {reasoning && (
        <div className={styles.section}>
          <h4>Astuce</h4>
          <p className={styles.reasoning}>{reasoning}</p>
        </div>
      )}
    </div>
  );
}

/** NEW: Per-message note/correction card (for the 2-column timeline). */
export function NoteCard({
  message,
  reasoningHint,
  onlyFor = 'ai+user',
}: {
  message: Message;
  reasoningHint?: string | null;
  /** 'ai' | 'user' | 'ai+user' — if you want to restrict which side gets cards */
  onlyFor?: 'ai' | 'user' | 'ai+user';
}) {
  if (onlyFor !== 'ai+user' && message.sender !== onlyFor) {
    return <div className={styles.noteCardEmpty}>—</div>;
  }

  const corrections = Array.isArray(message.corrections) ? message.corrections : [];

  // Be tolerant to different correction shapes
  const normalize = (c: any) => ({
    wrong: c?.userText ?? c?.from ?? c?.original ?? '',
    right: c?.correction ?? c?.to ?? c?.suggestion ?? '',
    tip: c?.explanation ?? c?.tip ?? '',
  });

  const hasCorrections = corrections.length > 0;
  const hasKeyPhrases = Array.isArray(message.keyPhrases) && message.keyPhrases.length > 0;

  if (!hasCorrections && !hasKeyPhrases && !reasoningHint) {
    return <div className={styles.noteCardEmpty}>—</div>;
  }

  return (
    <div className={styles.noteCard}>
      {hasCorrections && (
        <div className={styles.block}>
          <div className={styles.blockTitle}>Corrections</div>
          <ul className={styles.correctionsList}>
            {corrections.map((raw, i) => {
              const c = normalize(raw);
              return (
                <li key={i}>
                  <span className={styles.wrong}>“{c.wrong}”</span>
                  <span className={styles.sep}>→</span>
                  <span className={styles.correct}>“{c.right}”</span>
                  {c.tip && <div className={styles.explanation}>{c.tip}</div>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {hasKeyPhrases && (
        <div className={styles.block}>
          <div className={styles.blockTitle}>Expressions clés</div>
          <div className={styles.kpills}>
            {message.keyPhrases!.map((k, i) => (
              <span key={i} className={styles.kpill}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {reasoningHint && (
        <div className={styles.block}>
          <div className={styles.blockTitle}>Astuce</div>
          <p className={styles.reasoning}>{reasoningHint}</p>
        </div>
      )}
    </div>
  );
}
