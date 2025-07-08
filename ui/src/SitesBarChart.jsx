import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function getYearCounts(sites) {
  const counts = {};
  const names = {};
  let minYear = Infinity;
  let maxYear = -Infinity;
  sites.forEach(site => {
    const year = parseInt(site.nps_established);
    if (!isNaN(year)) {
      counts[year] = (counts[year] || 0) + 1;
      if (!names[year]) names[year] = [];
      names[year].push(site.name || 'Unnamed Site');
      if (year < minYear) minYear = year;
      if (year > maxYear) maxYear = year;
    }
  });
  if (!isFinite(minYear) || !isFinite(maxYear)) return [];
  const data = [];
  for (let y = minYear; y <= maxYear; y++) {
    data.push({ year: y, count: counts[y] || 0, names: names[y] || [] });
  }
  return data;
}

const SitesBarChart = ({ sites }) => {
  const data = getYearCounts(sites);
  if (data.length === 0) return <div style={{ color: 'red', padding: 20 }}>No establishment year data available.</div>;

  // Show every Nth year label to declutter
  const yearRange = data.length > 0 ? data[data.length - 1].year - data[0].year : 0;
  let tickInterval = 1;
  if (yearRange > 100) tickInterval = 10;
  else if (yearRange > 40) tickInterval = 5;
  else if (yearRange > 20) tickInterval = 2;

  // Custom XAxis tick formatter
  const xTickFormatter = (year, index) => {
    if ((year - data[0].year) % tickInterval === 0) return year;
    return '';
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const yearData = payload[0].payload;
      return (
        <div style={{ background: '#fff', border: '1px solid #1976d2', borderRadius: 8, padding: 12, minWidth: 180 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Year: {label}</div>
          <div><b>Sites Established:</b> {yearData.count}</div>
          {yearData.names && yearData.names.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <b>Sites:</b>
              <ul style={{ margin: 0, paddingLeft: 18, maxHeight: 120, overflowY: 'auto', fontSize: 13 }}>
                {yearData.names.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '60vh', marginBottom: 24 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" interval={0} height={60} tickFormatter={xTickFormatter} />
          <YAxis allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SitesBarChart;
