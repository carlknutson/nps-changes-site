import React from 'react';

// This widget uses the GitHub API to fetch recent commits for data/sites.json
// It works for public repos and does not require a token for public data
const GITHUB_API = 'https://api.github.com/repos/carlknutson/nps-changes-feed/commits?path=data/sites.json&per_page=5';


// Helper to fetch patch for a commit
async function fetchPatchForCommit(sha) {
  const url = `https://api.github.com/repos/carlknutson/nps-changes-feed/commits/${sha}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Failed to fetch commit details');
  const data = await resp.json();
  // Find the file patch for data/sites.json
  const file = (data.files || []).find(f => f.filename === 'data/sites.json');
  return file && file.patch ? file.patch : null;
}

function RecentDataChangesWidget() {
  const [commits, setCommits] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [patches, setPatches] = React.useState({});

  React.useEffect(() => {
    fetch(GITHUB_API)
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(async (commits) => {
        setCommits(commits);
        // Fetch patches for each commit in parallel
        const patchResults = await Promise.all(commits.map(async (commit) => {
          try {
            const patch = await fetchPatchForCommit(commit.sha);
            return [commit.sha, patch];
          } catch {
            return [commit.sha, null];
          }
        }));
        // Convert to object { sha: patch }
        const patchMap = {};
        patchResults.forEach(([sha, patch]) => { patchMap[sha] = patch; });
        setPatches(patchMap);
      })
      .catch(() => setError('Could not fetch recent changes.'));
  }, []);

  return (
    <div style={{ margin: '2.5rem 0 1.5rem 0', background: '#f7fafd', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: '1.2rem 1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.13rem', color: '#1976d2' }}>Recent Data Changes</h3>
      {error && <div style={{ color: '#b71c1c', fontSize: '1.01em' }}>{error}</div>}
      {!commits && !error && <div>Loading recent changes…</div>}
      {commits && commits.length === 0 && <div>No recent changes found for <code>sites.json</code>.</div>}
      {commits && commits.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {commits.map(commit => (
            <li key={commit.sha} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ fontWeight: 500, color: '#1a3a5b' }}>{commit.commit.message}</div>
              <div style={{ fontSize: 13, color: '#1976d2' }}>
                <a href={commit.html_url} target="_blank" rel="noopener noreferrer">{commit.sha.substring(0, 7)}</a>
                {' '}on {commit.commit.author.date.substring(0, 10)} by {commit.commit.author.name}
              </div>
              {patches[commit.sha] && (
                <pre style={{ background: '#f3f6fa', color: '#234', fontSize: 13, borderRadius: 6, padding: '0.7em 1em', marginTop: 8, overflowX: 'auto', maxHeight: 180 }}>
                  {patches[commit.sha].split('\n').slice(0, 10).join('\n')}
                  {patches[commit.sha].split('\n').length > 10 ? '\n…' : ''}
                </pre>
              )}
              <div style={{ marginTop: 6 }}>
                <a
                  href={`https://github.com/carlknutson/nps-changes-feed/commit/${commit.sha}#diff-${commit.files && commit.files[0] && commit.files[0].sha ? commit.files[0].sha : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1976d2', fontSize: 13, textDecoration: 'underline' }}
                >
                  View full diff on GitHub
                </a>
                {patches[commit.sha] === null && (
                  <span style={{ color: '#b71c1c', fontSize: 12, marginLeft: 8 }}>
                    (No patch preview available)
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
        Powered by <a href="https://github.com/carlknutson/npm-changes-site" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </div>
  );
}

export default RecentDataChangesWidget;
