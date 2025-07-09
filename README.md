
# npm-changes-site

An interactive explorer and change-tracker for all U.S. National Park Service (NPS) sites. This project provides a modern web UI for browsing, filtering, and visualizing NPS sites, including map, list, card, bar chart, and timeline views. It also tracks recent data changes and supports collectors interested in NPS passport stamps.

## Features

- Explore all NPS sites with filters for region, designation, and stamp availability
- Multiple views: card, list, map (with react-leaflet), bar chart, and abolished sites timeline
- "Over the Years" view: see all sites grouped by established year
- Recent Data Changes widget: shows latest GitHub commits and diffs for the data
- About, privacy, and data source info (see the in-app About page for more)
- Open source, no analytics, no user data collected

## Data Sources

- Main data: [`data/sites.json`](data/sites.json) (see [sites.json](https://github.com/carlknutson/npm-changes-site/blob/main/data/sites.json))
- Abolished sites: [`data/abolished_sites.json`](data/abolished_sites.json)
- Data is updated daily via GitHub Actions
- Most fields are from the [official NPS API](https://www.nps.gov/subjects/developer/api-documentation.htm), with some (region, established year, previous names) supplemented by manual research or AI assistance

## OpenAI Data Completion Scripts

This repo includes scripts in [`scripts/`](scripts/) that use OpenAI's API to help fill in missing data fields:

- `nps_established.py`: Queries OpenAI to identify the established year for a given NPS site
- `previous_names.py`: Queries OpenAI to list previous official names for a given NPS site

These scripts are for data maintainers and require an OpenAI API key. They are not used in the deployed web app.

## Development

This project uses React (with Vite), react-leaflet, recharts, and modern CSS. To run locally:

```sh
cd ui
npm install
npm run dev
```

## Privacy

This site does not collect, store, or share any personal information. No analytics or tracking cookies are used. All data is loaded directly from public sources or GitHub.

## License

MIT. Not affiliated with or endorsed by the National Park Service.