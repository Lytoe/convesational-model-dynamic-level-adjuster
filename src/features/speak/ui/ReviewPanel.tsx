import { SessionState } from '../domain/SessionState';

export default function ReviewPanel({ session, onClose }: { session: SessionState; onClose: () => void }) {
  
  const userMessages = session.messages.filter(m => m.sender === 'user');
  const corrections = userMessages.map(m => ({
    original: m.textPart1,
    corrected: (m as any).feedback?.correctedText || m.textPart1,
    tips: (m as any).feedback?.tips || []
  }));
  const tokens = corrections.flatMap(c =>
    c.corrected.split(/\s+/)
      .map(t => t.replace(/[.,;:!?()"]/g,'').trim())
      .filter(Boolean)
  );
  const vocab = Array.from(new Set(tokens)).slice(0, 10);

  const handleAddFavorite = async (word: string) => {
    
    alert(`"${word}" ajouté à vos favoris`);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '80%', maxHeight: '80%', overflowY: 'auto' }}>
        <h2>Résumé de la session</h2>

        <h3>Corrections :</h3>
        <ul>
          {corrections.map((c, i) => (
            <li key={i}>
              <p><strong>Vous :</strong> {c.original}</p>
              <p><strong>Correction :</strong> {c.corrected}</p>
              {c.tips.length > 0 && <p><em>Conseils : {c.tips.join(', ')}</em></p>}
            </li>
          ))}
        </ul>

        <h3>Vocabulaire clé :</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {vocab.map((word, i) => (
            <button key={i} onClick={() => handleAddFavorite(word)} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>
              ➕ {word}
            </button>
          ))}
        </div>

        <button onClick={onClose} style={{ marginTop: '1rem' }}>Fermer</button>
      </div>
    </div>
  );
}
