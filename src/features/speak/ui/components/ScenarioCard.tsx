import styles from '../../styles/ScenarioCard.module.css';

type Level = 'A1'|'A2'|'B1'|'B2'|'C1'|'C2';

type Props = {
  title: string;
  description: string;
  tags?: string[];
  thumb?: string;
  level?: Level;
  onClick: () => void;
};

export default function ScenarioCard({ title, description, tags = [], thumb, level, onClick }: Props) {
  return (
    <button className={styles.card} onClick={onClick} aria-label={title}>
      <div className={styles.thumb} data-hasimg={!!thumb} style={thumb ? { backgroundImage: `url(${thumb})` } : undefined} />
      {level && <span className={styles.badge} data-level={level}>{level}</span>}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{description}</p>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
          </div>
        )}
      </div>
    </button>
  );
}
