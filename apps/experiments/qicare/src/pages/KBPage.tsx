/* ─── KBPage — Knowledge Base and Training Centre ─── */
import React from 'react';

const KB_ARTICLES = [
  {
    title: 'How to use Voice Commands',
    content: 'Click the 🎤 icon at the bottom of the screen. Wait for the glow. Say things like "I gave Mom Tylenol" or "Started breathing treatment". The app will automatically log it.',
  },
  {
    title: 'Managing Timers',
    content: 'When you log a medication or treatment, a timer starts if a follow-up is needed. You can see active timers on the Dashboard. Click "Done" to clear them.',
  },
  {
    title: 'Understanding Warnings',
    content: 'If you log a medication that interacts with another (e.g., repeating Tylenol too soon), a gold "Caution" card will appear on the Dashboard. Do not ignore these.',
  },
  {
    title: 'COPD Best Practices',
    content: 'Monitor O2 levels during treatments. If Mom is struggling to breathe (labored), use the "Pain Check" button to record her status immediately.',
  },
];

export const KBPage: React.FC = () => {
  const [articles, setArticles] = React.useState(KB_ARTICLES);

  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/kb`)
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(err => console.warn('Using local KB fallback', err));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Knowledge Base</h1>
      </div>

      <div className="space-y-4">
        {articles.map((article, i) => (
          <div key={i} className="card">
            <div className="card-title" style={{ color: 'var(--color-accent)' }}>
              {article.title}
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-dim)' }}>
              {article.content}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">Training Manual</div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: 12 }}>
          Essential guide for primary caregivers and family members.
        </p>
        <div style={{ padding: 12, border: '1px dashed var(--color-glass-border)', borderRadius: 8 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Current Version: 1.0</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
            This manual is ready for NotebookLM ingestion to generate custom training videos.
          </div>
        </div>
      </div>
    </div>
  );
};
