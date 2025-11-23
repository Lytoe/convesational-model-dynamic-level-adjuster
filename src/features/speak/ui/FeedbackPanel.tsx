import { Feedback } from '../domain/Feedback';

export default function FeedbackPanel({ feedback }: { feedback?: Feedback }) {
  if (!feedback) return null;
  return (
    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
      <p><strong>Correction globale :</strong> {feedback.correctedText}</p>
      {feedback.tips.length > 0 && (
        <ul>
          {feedback.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      )}
      <p>Score : {feedback.score}/10</p>
    </div>
  );
}
