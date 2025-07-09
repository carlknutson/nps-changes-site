import React from 'react';
import abolishedSites from '../../data/abolished_sites.json';


function AbolishedTimeline() {
  // Sort by abolished year descending
  const sorted = [...abolishedSites].sort((a, b) => b.nps_abolished - a.nps_abolished);
  const minYear = Math.min(...abolishedSites.map(s => s.nps_established));
  const maxYear = Math.max(...abolishedSites.map(s => s.nps_abolished));
  const yearRange = maxYear - minYear;
  const barColor = '#1976d2';
  const barHeight = 28;
  const gap = 16;

  // For axis ticks (every 10 years)
  const axisStep = yearRange > 100 ? 20 : 10;
  const axisYears = [];
  for (let y = Math.ceil(minYear / axisStep) * axisStep; y <= maxYear; y += axisStep) {
    axisYears.push(y);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.3rem 0 1.5rem 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 6, fontSize: '2rem', letterSpacing: '-1px', color: '#1a3a5b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span role="img" aria-label="history" style={{ fontSize: 28, marginRight: 2 }}>📜</span>
        Abolished NPS Sites Timeline
      </h2>
      <div style={{ color: '#4a5a6a', fontSize: '1.09rem', marginBottom: 18, marginTop: 2, textAlign: 'center' }}>
        Explore the history of NPS sites that have been abolished or removed.
      </div>
      {/* Year axis */}
      <div style={{ background: 'linear-gradient(90deg,#f7fafd 60%,#f3f6fa 100%)', border: '1px solid #dbe7f3', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: '1.1rem 1.2rem 0.7rem 1.2rem', marginBottom: 18, marginLeft: 0, marginRight: 0 }}>
        <div style={{ position: 'relative', height: 32, marginLeft: 180, marginBottom: 0 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 18, height: 1, background: '#bcd' }} />
          {axisYears.map(year => (
            <div key={year} style={{
              position: 'absolute',
              left: `${((year - minYear) / yearRange) * 100}%`,
              top: 0,
              transform: 'translateX(-50%)',
              color: '#1976d2',
              fontWeight: 500,
              fontSize: 14,
              textAlign: 'center',
              minWidth: 30
            }}>{year}</div>
          ))}
          <div style={{ position: 'absolute', left: '50%', bottom: -18, transform: 'translateX(-50%)', color: '#888', fontSize: 13, fontWeight: 500 }}>Year</div>
        </div>
      </div>
      {/* Timeline bars */}
      <div>
        {sorted.map((site, i) => {
          const left = ((site.nps_established - minYear) / yearRange) * 100;
          const width = ((site.nps_abolished - site.nps_established) / yearRange) * 100;
          // Estimate px width for legibility (container is 900-180=720px)
          const pxWidth = width * 7.2; // 720px is 100%
          const yearsLabel = `${site.nps_established}–${site.nps_abolished}`;
          const showInside = pxWidth > 60;
          return (
            <div key={site.name} style={{ display: 'flex', alignItems: 'center', marginBottom: gap }}>
              <div style={{ width: 170, textAlign: 'right', paddingRight: 16 }}>
                <div style={{ fontWeight: 700, color: '#1a3a5b', fontSize: '1.09em', letterSpacing: '-0.5px' }}>{site.name}</div>
                <div style={{ color: '#1976d2', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><span role="img" aria-label="est">🏁</span>Est. {site.nps_established}</div>
                <div style={{ color: '#b71c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><span role="img" aria-label="abol">⛔</span>Abol. {site.nps_abolished}</div>
              </div>
              <div style={{ flex: 1, position: 'relative', height: barHeight, display: 'flex', alignItems: 'center' }}>
                <div style={{
                  position: 'absolute',
                  left: `${left}%`,
                  width: `${width}%`,
                  height: barHeight - 8,
                  background: barColor,
                  borderRadius: 6,
                  boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: 14,
                  paddingLeft: 10,
                  paddingRight: 10,
                  minWidth: 36,
                  zIndex: 1,
                  transition: 'background 0.2s',
                  cursor: 'default',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                  title={`${site.name}\n${site.nps_established} - ${site.nps_abolished}`}
                >
                  {showInside ? yearsLabel : null}
                </div>
                {!showInside && (
                  <span style={{
                    position: 'absolute',
                    left: `calc(${left}% + ${width}% + 6px)`,
                    color: '#1976d2',
                    fontWeight: 500,
                    fontSize: 14,
                    background: '#fff',
                    padding: '0 4px',
                    zIndex: 2,
                    pointerEvents: 'none',
                    textShadow: '0 1px 2px #fff',
                  }}>{yearsLabel}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ color: '#888', fontSize: '0.98rem', marginTop: '2.5rem', textAlign: 'center' }}>
        <div style={{
          margin: '0 auto 14px auto',
          maxWidth: 600,
          padding: '1.1rem 1.2rem',
          background: 'linear-gradient(90deg,#f7fafd 60%,#f3f6fa 100%)',
          border: '1px solid #dbe7f3',
          borderRadius: 9,
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '1.04rem',
          color: '#234',
          justifyContent: 'center',
        }}>
          <span role="img" aria-label="info" style={{ fontSize: 22, color: '#1976d2' }}>⚠️</span>
          <span><b>Disclaimer:</b> The official NPS API does not provide data on past or abolished sites. This data was accumulated from many online sources and may be incorrect or outdated.</span>
        </div>
        Data: <a href="https://github.com/carlknutson/nps-changes-feed/blob/main/data/abolished_sites.json" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>abolished_sites.json</a>
      </div>
    </div>
  );
}

export default AbolishedTimeline;
