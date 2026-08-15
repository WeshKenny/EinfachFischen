#!/usr/bin/env node
// Generates public/sitemap.xml from the current lakes.json + static routes.
// Runs automatically before every build (see package.json "prebuild").

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://einfachfischen.ch';
const LAKES_PATH = path.join(__dirname, '..', 'src', 'assets', 'data', 'lakes.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

const today = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/seen', changefreq: 'weekly', priority: '0.9' },
  { loc: '/patente', changefreq: 'weekly', priority: '0.7' },
  { loc: '/about', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' }
];

function main() {
  const lakes = JSON.parse(fs.readFileSync(LAKES_PATH, 'utf-8'));

  const lakeRoutes = lakes.map(lake => ({
    loc: `/lake/${lake.id}`,
    changefreq: 'monthly',
    priority: '0.8'
  }));

  const urls = [...staticRoutes, ...lakeRoutes];

  const body = urls.map(url => `  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');
  console.log(`sitemap.xml geschrieben: ${urls.length} URLs (${lakeRoutes.length} Seen + ${staticRoutes.length} feste Seiten)`);
}

main();
