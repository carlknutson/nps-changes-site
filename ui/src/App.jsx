import RecentDataChangesWidget from './RecentDataChangesWidget';
import RecentChangesPage from './RecentChangesPage';
// --- LazyImage component using Intersection Observer ---
function LazyImage({ src, alt, style, className }) {
  const [visible, setVisible] = React.useState(false);
  const imgRef = React.useRef();

  React.useEffect(() => {
    let observer;
    if (imgRef.current && 'IntersectionObserver' in window) {
      observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: '100px' }
      );
      observer.observe(imgRef.current);
    } else {
      setVisible(true);
    }
    return () => observer && observer.disconnect && observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={visible ? src : undefined}
      alt={alt}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: 8,
        ...style,
      }}
      className={className}
      loading="lazy"
    />
  );
}


import React, { useState } from 'react';
const MapPage = React.lazy(() => import('./MapPage'));
import sitesData from '../../data/sites.json';
import MapView from './MapView';
import SitesBarChart from './SitesBarChart';
import AbolishedTimeline from './AbolishedTimeline';

// --- Custom MultiSelect Dropdown with Checkboxes ---
function DesignationMultiSelect({ options, selected, setSelected }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleOption = (value) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const allSelected = selected.length === 0;
  const label = allSelected
    ? 'All designations'
    : `${selected.length} selected`;

  // Filter options by search
  const filteredOptions = search.trim() === ''
    ? options
    : options.filter(option => option.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div ref={dropdownRef} style={{ position: 'relative', minWidth: 160 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #bcd',
          background: '#fff',
          fontSize: '1em',
          cursor: 'pointer',
          boxShadow: open ? '0 2px 8px rgba(0,0,0,0.08)' : undefined,
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
        <span style={{ float: 'right', fontSize: 14, color: '#888' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            zIndex: 100,
            background: '#fff',
            border: '1px solid #bcd',
            borderRadius: 6,
            boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
            minWidth: 180,
            maxHeight: 260,
            overflowY: 'auto',
            padding: 6,
          }}
          role="listbox"
        >
          <div style={{ padding: '2px 6px', color: '#1976d2', fontWeight: 500, fontSize: '0.98em', marginBottom: 4 }}>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => setSelected([])}
                style={{ marginRight: 6 }}
              />
              All designations
            </label>
          </div>
          <div style={{ borderBottom: '1px solid #eee', margin: '2px 0 6px 0' }} />
          <input
            type="text"
            placeholder="Search designations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '96%',
              margin: '0 2%',
              marginBottom: 8,
              padding: '4px 8px',
              borderRadius: 5,
              border: '1px solid #bcd',
              fontSize: '0.98em',
              outline: 'none',
            }}
            autoFocus
          />
          {filteredOptions.length === 0 ? (
            <div style={{ color: '#888', fontSize: '0.97em', padding: '8px 0', textAlign: 'center' }}>No matches</div>
          ) : (
            filteredOptions.map(option => (
              <label key={option} style={{ display: 'flex', alignItems: 'center', padding: '2px 6px', cursor: 'pointer', fontSize: '0.98em' }}>
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  style={{ marginRight: 7 }}
                />
                {option}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// --- Helper functions and components ---
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
                    {site.photo_link && <LazyImage className="site-img" src={site.photo_link} alt={site.name} style={{marginBottom: '0.4rem'}} />}
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
            {site.photo_link && <LazyImage className="site-img" src={site.photo_link} alt={site.name} style={{marginBottom: '0.4rem'}} />}
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

// --- Main App component ---


function App() {
  // Remove navOpen and isMobile, always use top nav
  const [sortBy, setSortBy] = useState('name');
  const [region, setRegion] = useState('all');
  const [hasStamps, setHasStamps] = useState('all');
  const [designationsSelected, setDesignationsSelected] = useState([]); // [] means all
  const [mainView, setMainView] = useState('card');
  const [view, setView] = useState('all');
  const [condensed, setCondensed] = useState(false);
  const [siteSearch, setSiteSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Responsive check for mobile (simple window width check)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 700;

  // Filter and sort
  let filtered = sitesData.filter(site => site.name && site.nps_established);
  if (region !== 'all') filtered = filtered.filter(site => site.region === region);
  if (hasStamps !== 'all') filtered = filtered.filter(site => !!site.has_stamps === (hasStamps === 'yes'));
  if (designationsSelected.length > 0) {
    filtered = filtered.filter(site => designationsSelected.includes(site.designation));
  }
  if (siteSearch.trim() !== '') {
    const searchLower = siteSearch.trim().toLowerCase();
    filtered = filtered.filter(site => site.name.toLowerCase().includes(searchLower));
  }
  filtered = [...filtered].sort(sorters[sortBy]);

  // Sites grouped by year (all years)
  const allSitesByYear = sitesData.filter(site => site.name && site.nps_established);

  const regions = getUniqueRegions(sitesData);
  const designations = Array.from(new Set(sitesData.map(site => site.designation).filter(Boolean))).sort();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar (always) */}
      <header style={{
        width: '100%',
        background: '#1976d2',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.7rem 1.1rem',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
      }}>
        <nav>
          {[
            { key: 'all', label: 'Explore' },
            { key: 'recent', label: 'Years' },
            { key: 'abolished', label: 'Abolished' },
            { key: 'changes', label: 'Changes' },
            { key: 'about', label: 'About' },
          ].map(item => (
            <button
              key={item.key}
              style={{
                background: view === item.key ? '#fff' : 'transparent',
                color: view === item.key ? '#1976d2' : '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '0.45rem 0.7rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '1rem',
                marginLeft: 6,
                marginRight: 0,
                outline: view === item.key ? '2px solid #fff' : 'none',
                boxShadow: view === item.key ? '0 2px 8px rgba(25,118,210,0.08)' : undefined,
                transition: 'all 0.13s',
              }}
              onClick={() => setView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '1.2rem 2vw' }}>
        <div className="controls filter-controls" style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 12, alignItems: 'flex-end' }}>
          {view === 'all' && (
            <>
              {/* Site search always visible */}
              <div style={{ minWidth: 220, marginRight: 16, flex: isMobile ? '1 1 100%' : undefined }}>
                <label htmlFor="site-search">Site Name:</label>
                <input
                  id="site-search"
                  type="text"
                  placeholder="Search site names..."
                  value={siteSearch}
                  onChange={e => setSiteSearch(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: 2,
                    padding: '4px 8px',
                    borderRadius: 5,
                    border: '1px solid #bcd',
                    fontSize: '0.98em',
                    outline: 'none',
                  }}
                />
              </div>
              {/* Collapsible filters for mobile */}
              {isMobile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(o => !o)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 6,
                      border: '1px solid #bcd',
                      background: '#f7fafd',
                      color: '#1976d2',
                      fontWeight: 600,
                      fontSize: '1em',
                      marginBottom: 6,
                      cursor: 'pointer',
                    }}
                  >
                    {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  {filtersOpen && (
                    <div style={{ width: '100%' }}>
                      <div>
                        <label>View:</label>
                        <select
                          value={mainView}
                          onChange={e => setMainView(e.target.value)}
                        >
                          <option value="card">Card</option>
                          <option value="list">List</option>
                          <option value="map">Map</option>
                          <option value="barchart">Bar Chart</option>
                        </select>
                      </div>
                      {mainView !== 'map' && mainView !== 'barchart' && (
                        <div>
                          <label>Sort by:</label>
                          <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                          >
                            <option value="name">Name</option>
                            <option value="year">Established Year</option>
                            <option value="region">Region</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label>Region:</label>
                        <select
                          value={region}
                          onChange={e => setRegion(e.target.value)}
                        >
                          <option value="all">All</option>
                          {regions.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>Has Stamps:</label>
                        <select
                          value={hasStamps}
                          onChange={e => setHasStamps(e.target.value)}
                        >
                          <option value="all">All</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div style={{ minWidth: 160, position: 'relative' }}>
                        <label>Designation:</label>
                        <DesignationMultiSelect
                          options={designations}
                          selected={designationsSelected}
                          setSelected={setDesignationsSelected}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label>View:</label>
                    <select
                      value={mainView}
                      onChange={e => setMainView(e.target.value)}
                    >
                      <option value="card">Card</option>
                      <option value="list">List</option>
                      <option value="map">Map</option>
                      <option value="barchart">Bar Chart</option>
                    </select>
                  </div>
                  {mainView !== 'map' && mainView !== 'barchart' && (
                    <div>
                      <label>Sort by:</label>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                      >
                        <option value="name">Name</option>
                        <option value="year">Established Year</option>
                        <option value="region">Region</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label>Region:</label>
                    <select
                      value={region}
                      onChange={e => setRegion(e.target.value)}
                    >
                      <option value="all">All</option>
                      {regions.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Has Stamps:</label>
                    <select
                      value={hasStamps}
                      onChange={e => setHasStamps(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div style={{ minWidth: 160, position: 'relative' }}>
                    <label>Designation:</label>
                    <DesignationMultiSelect
                      options={designations}
                      selected={designationsSelected}
                      setSelected={setDesignationsSelected}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
        {view === 'changes' ? (
          <RecentChangesPage />
        ) : view === 'about' ? (
          <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.09)', padding: '2.3rem 2.7rem' }}>
            <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: '2rem', letterSpacing: '-1px', color: '#1a3a5b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span role="img" aria-label="info" style={{ fontSize: 28, marginRight: 2 }}>ℹ️</span>
              About This Site
            </h2>
            <div style={{ color: '#4a5a6a', fontSize: '1.09rem', marginBottom: 18, marginTop: 2 }}>
              Learn about the data, privacy, and project motivation behind this site.
            </div>
            <div style={{ margin: '1.5rem 0 1.7rem 0', padding: '1.2rem 1.3rem', background: 'linear-gradient(90deg,#f7fafd 60%,#f3f6fa 100%)', border: '1px solid #dbe7f3', borderRadius: 9, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span role="img" aria-label="warning" style={{ fontSize: 22, color: '#1976d2' }}>⚠️</span>
                <span style={{ fontWeight: 600, fontSize: '1.08rem', color: '#1976d2' }}>Not affiliated with or endorsed by the National Park Service (NPS).</span>
              </div>
              <div style={{ fontSize: '1.07rem', color: '#234', marginLeft: 2 }}>
                This is an independent project for visualizing all NPS sites using data from the <a href="https://www.nps.gov/subjects/developer/api-documentation.htm" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>official NPS API</a> as the primary source. Some data fields (such as <b>region</b>, <b>nps_established</b>, and <b>previous_name</b>) were retrieved or supplemented from other sources or manual research, and may not be present in the official API.
              </div>
            </div>
            <h3 style={{ color: '#1a3a5b', fontWeight: 600, fontSize: '1.13rem', marginTop: 24, marginBottom: 7 }}>Why This Project?</h3>
            <p style={{ fontSize: '1.08rem', marginBottom: 18 }}>
              I originally built this site to create an RSS feed for tracking changes to NPS sites, but it has grown into a visualizer and exploration tool for all National Park Service locations. If you are a collector of NPS stamps, this site can help you discover new sites and track changes over time. It can also help you find sites that may not be in your passport book, such as those without stamps or those that have been renamed or re-designated.
            </p>
            <h3 style={{ color: '#1a3a5b', fontWeight: 600, fontSize: '1.13rem', marginTop: 24, marginBottom: 7 }}>Privacy</h3>
            <p style={{ fontSize: '1.08rem', marginBottom: 18 }}>
              <b>This site does not collect, store, or share any personal information.</b> No analytics or tracking cookies are used. No user data is collected. All data is loaded directly from public sources or GitHub.
            </p>
            <h3 style={{ color: '#1a3a5b', fontWeight: 600, fontSize: '1.13rem', marginTop: 24, marginBottom: 7 }}>Data Updates</h3>
            <p style={{ fontSize: '1.08rem', marginBottom: 18 }}>
              The data is updated daily via GitHub Actions.
            </p>
            <p style={{ color: '#888', fontSize: '0.98rem', marginTop: '2.2rem', textAlign: 'center' }}>
              This project is open source. View the code or contribute on <a href="https://github.com/carlknutson/nps-changes-site" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>GitHub</a>.
            </p>
          </div>
        ) : view === 'abolished' ? (
          <AbolishedTimeline />
        ) : (
          view === 'map' ? (
            <React.Suspense fallback={<div>Loading map…</div>}>
              <MapPage />
            </React.Suspense>
          ) : (
            <>
            {view === 'all' && (
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ color: '#1a3a5b', fontWeight: 700, fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span role="img" aria-label="binoculars" style={{ fontSize: 28 }}>🔎</span>
                    Explore NPS Sites
                  </h2>
                  <span style={{ color: '#888', fontSize: '0.98rem' }}>
                    Data: <a href="https://github.com/carlknutson/nps-changes-site/blob/main/data/sites.json" target="_blank" rel="noopener noreferrer">sites.json</a>
                  </span>
                </div>
                <div style={{ color: '#4a5a6a', fontSize: '1.09rem', marginBottom: 18, marginTop: 2, maxWidth: 700 }}>
                  Browse, filter, and visualize all National Park Service sites. Use the controls above to filter by region, designation, or stamp availability, and switch between card, list, map, or bar chart views. Click a site for more info or to visit its official NPS page.
                </div>
                <div style={{ marginBottom: 32 }}>
                  {mainView === 'map' ? (
                    <MapView sites={filtered} />
                  ) : mainView === 'list' ? (
                    <SiteGrid sites={filtered} condensed={true} />
                  ) : mainView === 'barchart' ? (
                    <SitesBarChart sites={filtered} />
                  ) : (
                    <SiteGrid sites={filtered} condensed={false} />
                  )}
                </div>
                <div style={{ color: '#888', fontSize: '0.98rem', margin: '2.5rem auto 0 auto', textAlign: 'center' }}>
                  Showing <b>{filtered.length}</b> of <b>{sitesData.length}</b> sites
                </div>
              </div>
            )}
              {view === 'recent' && (
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ color: '#1a3a5b', fontWeight: 700, fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span role="img" aria-label="calendar" style={{ fontSize: 28 }}>📅</span>
                      Over the Years
                    </h2>
                    <span style={{ color: '#888', fontSize: '0.98rem' }}>
                      Data: <a href="https://github.com/carlknutson/nps-changes-site/blob/main/data/sites.json" target="_blank" rel="noopener noreferrer">sites.json</a>
                    </span>
                  </div>
                  <div style={{ color: '#4a5a6a', fontSize: '1.09rem', marginBottom: 18, marginTop: 2, maxWidth: 700 }}>
                    Explore all NPS sites grouped by the year they were established or redesignated. This view lets you see the evolution of the National Park System over time. Click a site name for more info or to visit its official NPS page.
                  </div>
                  {/* YearOrderedTimeline moved below main App for top-level scope */}
                  <YearOrderedTimeline sites={allSitesByYear} condensed={condensed} />
                  <div style={{ color: '#888', fontSize: '0.98rem', margin: '2.5rem auto 0 auto', textAlign: 'center' }}>
                    Showing <b>{allSitesByYear.length}</b> sites
                  </div>
                </div>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
}

// --- YearOrderedTimeline: all sites grouped by year ---
function YearOrderedTimeline({ sites, condensed = false }) {
  // Group sites by year
  const yearMap = {};
  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    const year = parseInt(site.nps_established);
    if (!year || isNaN(year)) continue;
    if (!yearMap[year]) yearMap[year] = [];
    yearMap[year].push(site);
  }
  const years = Object.keys(yearMap).map(function(n) { return Number(n); }).sort(function(a, b) { return b - a; });
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {years.map(function(year) {
        return (
          <div key={year} style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: 4 }}>{year}</h3>
            {yearMap[year].length === 0 ? (
              <span style={{ color: '#aaa', fontStyle: 'italic' }}>No new sites</span>
            ) : condensed ? (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {yearMap[year].map(function(site) {
                  return (
                    <li key={site.name} style={{ marginBottom: 8 }}>
                      <a href={site.nps_link} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: '#1976d2', textDecoration: 'underline dotted #bcd' }}>{site.name}</a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                {yearMap[year].map(function(site) {
                  return (
                    <div className="site-card" key={site.name} style={{ minWidth: 280, flex: '1 1 320px', maxWidth: 340 }}>
                      <a className="site-title" href={site.nps_link} target="_blank" rel="noopener noreferrer">
                        {site.photo_link && <LazyImage className="site-img" src={site.photo_link} alt={site.name} style={{marginBottom: '0.4rem'}} />}
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
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default App;
