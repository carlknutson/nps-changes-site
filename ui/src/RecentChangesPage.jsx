import React from 'react';
import RecentDataChangesWidget from './RecentDataChangesWidget';

export default function RecentChangesPage() {
  // Copy-to-clipboard for RSS URL
  const rssUrl = "https://github.com/carlknutson/nps-changes-site/commits/main/data/sites.json.atom";
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.09)', padding: '2.3rem 2.7rem' }}>
      <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: '2rem', letterSpacing: '-1px', color: '#1a3a5b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span role="img" aria-label="clock" style={{ fontSize: 28, marginRight: 2 }}>🕒</span>
        Recent Data Changes
      </h2>
      <div style={{ color: '#4a5a6a', fontSize: '1.09rem', marginBottom: 18, marginTop: 2 }}>
        See the latest updates to the NPS sites data. Subscribe to changes or view recent edits below.
      </div>
      <RecentDataChangesWidget />
      <div style={{ margin: '2.5rem 0 0.7rem 0', padding: '1.2rem 1.3rem', background: 'linear-gradient(90deg,#eaf4ff 60%,#f7fafd 100%)', border: '1px solid #bcd', borderRadius: 9, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span role="img" aria-label="rss" style={{ fontSize: 22, color: '#1976d2' }}>🔔</span>
          <span style={{ fontWeight: 600, fontSize: '1.08rem', color: '#1976d2' }}>Track Changes via RSS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 7 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 15, background: '#f3f6fa', border: '1px solid #dbe7f3', borderRadius: 5, padding: '3px 8px', color: '#234' }}>{rssUrl}</span>
          <button onClick={handleCopy} style={{ fontSize: 14, padding: '3px 12px', borderRadius: 5, border: '1px solid #1976d2', background: copied ? '#d0eaff' : '#fff', color: '#1976d2', cursor: 'pointer', fontWeight: 500, marginLeft: 2 }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <ol style={{ fontSize: '1.04rem', margin: '0 0 0 1.2em', padding: 0 }}>
          <li>Copy the RSS feed URL above.</li>
          <li>Paste it into your favorite RSS reader (such as Feedly, Inoreader, or any browser extension).</li>
          <li>You'll receive updates whenever the <code>sites.json</code> file changes.</li>
        </ol>
      </div>
      <p style={{ color: '#888', fontSize: '0.98rem', marginTop: '2.2rem', textAlign: 'center' }}>
        This project is open source. View the code or contribute on <a href="https://github.com/carlknutson/nps-changes-site" target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>
    </div>
  );
}
