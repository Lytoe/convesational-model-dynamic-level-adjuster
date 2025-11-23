import { startSpeechRecognition } from '../infra/speechRecognitionAdapter';
import { useState } from 'react';
import styles from '../styles/InputControls.module.css';
import { SessionState } from '../domain/SessionState';

export default function InputControls({
  onSend,
  session,
  onHintOpened, // 👈 NEW (optional)
}: {
  onSend: (input: string) => void;
  session: SessionState;
  onHintOpened?: () => void; // 👈 NEW
}) {
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const hint = session.hint;

  const handleRecord = () => {
    if (recording) return;
    setRecording(true);
    startSpeechRecognition((result) => {
      setText(result);
      setRecording(false);
    });
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    setShowHint(false);
  };

  return (
    <div className={styles.inputWrapper}>
      {hint && (
        <div className={styles.hintSection}>
          {showHint ? (
            <div className={styles.hintBox}>
              <p><strong>💡 Réponse A :</strong> {hint.responseA}</p>
              <p><strong>💡 Réponse B :</strong> {hint.responseB}</p>
              <p className={styles.reasoning}>{hint.reasoning}</p>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowHint(true);
                onHintOpened?.(); // 👈 NEW: mark hint used
              }}
              className={styles.hintToggle}
            >
              💡 Besoin d’un coup de pouce ?
            </button>
          )}
        </div>
      )}

      <div className={styles.controlsRow}>
        <input
          className={styles.inputField}
          placeholder="Tapez ou enregistrez votre réponse..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className={`${styles.iconButton} ${recording ? styles.recording : ''}`}
          onClick={handleRecord}
        >
          🎙️
        </button>
        <button className={styles.sendButton} onClick={handleSend}>
          Envoyer
        </button>
      </div>
    </div>
  );
}
