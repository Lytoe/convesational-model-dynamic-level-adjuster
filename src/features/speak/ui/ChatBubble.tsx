"use client";
import { useState } from 'react';
import styles from '../styles/ChatBubble.module.css';
import { playTTS } from '../infra/ttsAdapter';
import { translateText } from '../infra/translationAdapter';

export default function ChatBubble({
  sender,
  textPart1,
  textPart2,
  onTranslated,
}: {
  sender: 'ai' | 'user';
  textPart1: string;
  textPart2?: string;
  onTranslated?: () => void;
}) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    try {
      setLoading(true);
      const fullText = `${textPart1} ${textPart2 || ''}`.trim();
      const translated = await translateText(fullText, 'en');
      setTranslation(translated);
      onTranslated?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.chatBubble} ${sender === 'user' ? styles.user : ''}`}>
      <div className={styles.bubbleContent}>
        {textPart1 && <p>{textPart1}</p>}
        {textPart2 && <p>{textPart2}</p>}

        <div className={styles.actions}>
          <button
            className={styles.ttsButton}
            onClick={handleTranslate}
            disabled={loading}
          >
            {loading ? '...' : '🌍 Traduire'}
          </button>

          {sender === 'ai' && (
            <button
              className={styles.ttsButton}
              onClick={() => playTTS(`${textPart1} ${textPart2 || ''}`.trim())}
            >
              ▶ Écouter
            </button>
          )}
        </div>

        {translation && (
          <span className={styles.translation}>{translation}</span>
        )}
      </div>
    </div>
  );
}
