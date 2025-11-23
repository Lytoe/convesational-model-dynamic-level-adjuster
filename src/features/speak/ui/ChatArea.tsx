import ChatBubble from './ChatBubble';
import FeedbackPanel from './FeedbackPanel';
import { Message } from '../domain/Message';
import styles from '../styles/ChatArea.module.css';

export default function ChatArea({
  messages,
  onTranslated,
  thinking,
}: {
  messages: Message[];
  onTranslated?: () => void;
  thinking?: boolean;
}) {
  // ❗️No local scrolling here — parent owns the single shared scrollbar.
  // This component is now purely presentational.

  return (
    <div className={styles.chatContainer}>
      {messages.map((msg) => (
        <div key={msg.id} className={styles.messageWrapper}>
          <ChatBubble
            sender={msg.sender}
            textPart1={msg.textPart1}
            textPart2={msg.textPart2}
            onTranslated={onTranslated}
          />
          {msg.sender === 'user' && <FeedbackPanel />}
        </div>
      ))}

      {thinking && (
        <div className={styles.messageWrapper}>
          <div
            className={styles.aiTypingBubble}
            aria-live="polite"
            aria-label="AI typing"
          >
            …
          </div>
        </div>
      )}
    </div>
  );
}
