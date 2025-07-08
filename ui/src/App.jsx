import React, { useState } from 'react';
const MapPage = React.lazy(() => import('./MapPage'));
import sitesData from '../../data/sites.json';
import MapView from './MapView';
import SitesBarChart from './SitesBarChart';

const getUniqueRegions = (sites) => {
  const regions = new Set();
  sites.forEach(site => {
    if (site.region) regions.add(site.region);
  });
  return Array.from(regions).sort();
};

const sorters = {
  name: (a, b) => (a.name || '').localeCompare(b.name || ''),
  year: (a, b) => (parseInt(a.nps_established) || 0) - (parseInt(b.nps_established) || 0),
  region: (a, b) => (a.region || '').localeCompare(b.region || ''),
};

const isRecent = (site, currentYear = 2025) => {
  const year = parseInt(site.nps_established);
  return year && year >= currentYear - 5;
};

function TimelineView({ sites, startYear = 2025, yearsBack = 5, condensed = false }) {
  // Group sites by year
  const yearMap = {};
  for (let y = startYear; y >= startYear - yearsBack + 1; y--) {
    yearMap[y] = [];
  }
  sites.forEach(site => {
    const year = parseInt(site.nps_established);
    if (yearMap[year]) {
      yearMap[year].push(site);
    }
  });
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Recently Added NPS Sites (Last 5 Years)</h2>
      {Object.keys(yearMap).sort((a, b) => b - a).map(year => (
        <div key={year} style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 4 }}>{year}</h3>
          {yearMap[year].length === 0 ? (
            <span style={{ color: '#aaa', fontStyle: 'italic' }}>No new sites</span>
          ) : condensed ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {yearMap[year].map(site => (
                <li key={site.name} style={{ marginBottom: 8 }}>
                  <a href={site.nps_link} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: '#1976d2', textDecoration: 'underline dotted #bcd' }}>{site.name}</a>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {yearMap[year].map(site => (
                <div className="site-card" key={site.name} style={{ minWidth: 280, flex: '1 1 320px', maxWidth: 340 }}>
                  <a className="site-title" href={site.nps_link} target="_blank" rel="noopener noreferrer">
                    {site.photo_link && <img className="site-img" src={site.photo_link} alt={site.name} style={{marginBottom: '0.4rem'}} />}
                    {site.name}
                    <div className="site-hover">
                      <div className="site-desc">{site.description}</div>
                      <div className="site-meta">
                        <div><b>Region:</b> {site.region || 'N/A'}</div>
                        <div><b>Stamps:</b> {site.has_stamps ? 'Yes' : 'No'}</div>
                        {site.previous_names && site.previous_names.length > 0 && (
                          <div><b>Previous names:</b> {site.previous_names.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SiteGrid({ sites, condensed = false }) {
  if (condensed) {
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {sites.map(site => (
          <li key={site.name} style={{ marginBottom: 8 }}>
            <a href={site.nps_link} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: '#1976d2', textDecoration: 'underline dotted #bcd' }}>{site.name}</a>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="site-grid">
      {sites.map(site => (
        <div className="site-card" key={site.name}>
          <a className="site-title" href={site.nps_link} target="_blank" rel="noopener noreferrer">
            {site.photo_link && <img className="site-img" src={site.photo_link} alt={site.name} style={{marginBottom: '0.4rem'}} />}
            {site.name}
            <div className="site-hover">
              <div className="site-desc">{site.description}</div>
              <div className="site-meta">
                <div><b>Region:</b> {site.region || 'N/A'}</div>
                <div><b>Established:</b> {site.nps_established || 'N/A'}</div>
                <div><b>Stamps:</b> {site.has_stamps ? 'Yes' : 'No'}</div>
                {site.previous_names && site.previous_names.length > 0 && (
                  <div><b>Previous names:</b> {site.previous_names.join(', ')}</div>
                )}
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [navOpen, setNavOpen] = React.useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [region, setRegion] = useState('all');
  const [hasStamps, setHasStamps] = useState('all');
  const [mainView, setMainView] = useState('card'); // 'card', 'list', 'map'
  const [view, setView] = useState('all');
  const [condensed, setCondensed] = useState(false);

  // Filter and sort
  let filtered = sitesData.filter(site => site.name && site.nps_established);
  if (region !== 'all') filtered = filtered.filter(site => site.region === region);
  if (hasStamps !== 'all') filtered = filtered.filter(site => !!site.has_stamps === (hasStamps === 'yes'));
  filtered = [...filtered].sort(sorters[sortBy]);

  // Recent sites (established in last 5 years)
  const recentSites = sitesData.filter(site => site.name && isRecent(site));

  const regions = getUniqueRegions(sitesData);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Collapsible Nav Panel */}
      <nav style={{
        width: navOpen ? 220 : 56,
        background: '#f0f4f8',
        borderRight: '1px solid #e0e0e0',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.2s',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: navOpen ? 'flex-start' : 'center',
        padding: navOpen ? '2rem 1rem 1rem 1rem' : '1rem 0',
      }}>
        <button
          aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setNavOpen(o => !o)}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            marginBottom: navOpen ? 24 : 0,
            cursor: 'pointer',
            alignSelf: navOpen ? 'flex-end' : 'center',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {navOpen ? '←' : '☰'}
        </button>
        {navOpen && (
          <>
            <h2 style={{ fontSize: '1.2rem', margin: 0, marginBottom: '2.5rem', color: '#1a3a5b', alignSelf: 'flex-start' }}>Navigation</h2>
            <button
              style={{
                background: view === 'all' ? '#1976d2' : '#fff',
                color: view === 'all' ? '#fff' : '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: 6,
                padding: '0.6rem 1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 12,
                width: '100%',
                textAlign: 'left',
              }}
              onClick={() => setView('all')}
            >
              Explore Sites
            </button>
            <button
              style={{
                background: view === 'recent' ? '#1976d2' : '#fff',
                color: view === 'recent' ? '#fff' : '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: 6,
                padding: '0.6rem 1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 12,
                width: '100%',
                textAlign: 'left',
              }}
              onClick={() => setView('recent')}
            >
              Added in Last 5 Years
            </button>
            <button
              style={{
                background: view === 'about' ? '#1976d2' : '#fff',
                color: view === 'about' ? '#fff' : '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: 6,
                padding: '0.6rem 1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 12,
                width: '100%',
                textAlign: 'left',
              }}
              onClick={() => setView('about')}
            >
              About
            </button>
          </>
        )}
      </nav>
      <main style={{ flex: 1, padding: '2rem 2.5vw' }}>
        <h1 style={{ textAlign: 'center' }}>National Sites</h1>
        <div className="controls" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 24 }}>
          {view === 'all' && (
            <>
              <label>
                View:
                <select value={mainView} onChange={e => setMainView(e.target.value)}>
                  <option value="card">Card</option>
                  <option value="list">List</option>
                  <option value="map">Map</option>
                  <option value="barchart">Bar Chart</option>
                </select>
              </label>
              {mainView !== 'map' && mainView !== 'barchart' && (
                <label>
                  Sort by:
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="name">Name</option>
                    <option value="year">Established Year</option>
                    <option value="region">Region</option>
                  </select>
                </label>
              )}
              <label>
                Region:
                <select value={region} onChange={e => setRegion(e.target.value)}>
                  <option value="all">All</option>
                  {regions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label>
                Has Stamps:
                <select value={hasStamps} onChange={e => setHasStamps(e.target.value)}>
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
            </>
          )}
        </div>
        {view === 'about' ? (
          <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2rem 2.5rem' }}>
            <h2 style={{ marginTop: 0 }}>About This Site</h2>
            <p style={{ fontSize: '1.08rem' }}>
              <b>This site is not affiliated with or endorsed by the National Park Service (NPS).</b> It is an independent project for visualizing all NPS sites using data from the public NPS API.
            </p>
            <p style={{ fontSize: '1.08rem' }}>
              The data is updated daily via automation, and the full list of sites is available as a JSON file here:<br />
              <a href="https://github.com/carlknutson/nps-changes-feed/blob/main/data/sites.json" target="_blank" rel="noopener noreferrer">https://github.com/carlknutson/nps-changes-feed/blob/main/data/sites.json</a>
            </p>
            <h3>Track Changes via RSS</h3>
            <p style={{ fontSize: '1.08rem' }}>
              You can subscribe to changes in the <code>sites.json</code> file as an RSS feed using GitHub's built-in feed for file commits.<br />
              <b>RSS Feed URL:</b><br />
              <a href="https://github.com/carlknutson/nps-changes-feed/commits/main/data/sites.json.atom" target="_blank" rel="noopener noreferrer">https://github.com/carlknutson/nps-changes-feed/commits/main/data/sites.json.atom</a>
            </p>
            <ol style={{ fontSize: '1.08rem' }}>
              <li>Copy the RSS feed URL above.</li>
              <li>Paste it into your favorite RSS reader (such as Feedly, Inoreader, or any browser extension).</li>
              <li>You'll receive updates whenever the <code>sites.json</code> file changes.</li>
            </ol>
            <p style={{ color: '#888', fontSize: '0.98rem', marginTop: '2rem' }}>
              This project is open source. View the code or contribute on <a href="https://github.com/carlknutson/nps-changes-feed" target="_blank" rel="noopener noreferrer">GitHub</a>.
            </p>
          </div>
        ) : (
          view === 'map' ? (
            <React.Suspense fallback={<div>Loading map…</div>}>
              <MapPage />
            </React.Suspense>
          ) : (
            <>
            {view === 'all' && (
              mainView === 'map' ? (
                <MapView sites={filtered} />
              ) : mainView === 'list' ? (
                <SiteGrid sites={filtered} condensed={true} />
              ) : mainView === 'barchart' ? (
                <SitesBarChart sites={filtered} />
              ) : (
                <SiteGrid sites={filtered} condensed={false} />
              )
            )}
              {view === 'recent' && (
                <TimelineView sites={recentSites} condensed={condensed} />
              )}
            </>
          )
        )}
      </main>
    </div>
  );
}
