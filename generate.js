'use strict';

/* =====================================================================
   generate.js
   Static site generator for denverlegalai.com
   - Reads ./data  (expects data.locations and data.niches arrays)
   - Renders each niche x location page via ./template
   - Writes dist/<location-slug>/<niche-slug>/index.html
   - Writes dist/index.html (homepage), sitemap.xml and robots.txt
   Items may be plain strings or objects ({ name, slug, description, suburbs }).
   ===================================================================== */

const fs = require('fs');
const path = require('path');
const data = require('./data');
const renderPage = require('./template');

const esc = renderPage.esc;
const nameOf = renderPage.nameOf;
const slugOf = renderPage.slugOf;
const descOf = renderPage.descOf;
const BASE_CSS = renderPage.baseCSS;
const headCommon = renderPage.headCommon;
const ICONS = renderPage.icons;
const SITE_URL = renderPage.SITE_URL;

const DIST = path.join(__dirname, 'dist');
const locations = Array.isArray(data.locations) ? data.locations : [];
const niches = Array.isArray(data.niches) ? data.niches : [];

if (locations.length === 0 || niches.length === 0) {
  console.error('ERROR: ./data must export non-empty "locations" and "niches" arrays.');
  process.exit(1);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, 'utf8');
}

function suburbsOf(location) {
  if (!location || typeof location !== 'object') return [];
  const list = location.suburbs || location.neighborhoods || location.areas || location.zips || [];
  return Array.isArray(list) ? list : [];
}

/* ---------------------------------------------------------------
   1. Programmatic pages
   --------------------------------------------------------------- */

// clean previous build
fs.rmSync(DIST, { recursive: true, force: true });
ensureDir(DIST);

const sitemapUrls = [SITE_URL + '/'];
let pageCount = 0;

locations.forEach(function (location) {
  const locSlug = slugOf(location);
  niches.forEach(function (niche) {
    const nicheSlug = slugOf(niche);
    const html = renderPage(niche, location);
    writeFile(path.join(DIST, locSlug, nicheSlug, 'index.html'), html);
    sitemapUrls.push(SITE_URL + '/' + locSlug + '/' + nicheSlug + '/');
    pageCount += 1;
  });
});

/* ---------------------------------------------------------------
   2. Homepage building blocks (each array is joined with '\n')
   --------------------------------------------------------------- */

const firstNicheSlug = slugOf(niches[0]);

// Active legal hubs (2-column feature layout)
const hubCards = niches.map(function (niche, i) {
  const nName = nameOf(niche);
  const nSlug = slugOf(niche);
  const nDesc = descOf(niche) ||
    ('Vetted ' + nName.toLowerCase() + ' attorneys, matched to your case across ' + locations.length + ' Colorado markets.');
  const topLocation = locations[i % locations.length];
  const href = '/' + slugOf(topLocation) + '/' + nSlug + '/';
  return [
    '<a href="' + esc(href) + '" class="dl-card" style="display:block">',
    '  <div style="display:flex;align-items:center;justify-content:space-between">',
    '    <div class="dl-ico">' + ICONS.scale.replace(/#fff/g, 'currentColor') + '</div>',
    '    <span class="dl-pill" style="padding:4px 10px;font-size:11.5px"><span class="dl-dot"></span>Active</span>',
    '  </div>',
    '  <h3>' + esc(nName) + '</h3>',
    '  <p>' + esc(nDesc) + '</p>',
    '  <div style="margin-top:16px;font-size:13.5px;font-weight:700;color:#93c5fd">Find an attorney &rarr;</div>',
    '</a>'
  ].join('\n');
}).join('\n');

// Verification badges
const badges = [
  { t: 'Bar license verified', d: 'Every attorney is checked against the Colorado bar roster before approval.' },
  { t: 'Disciplinary screening', d: 'We review public disciplinary history and decline any flagged profiles.' },
  { t: 'Client-first reviews', d: 'Ongoing feedback keeps match quality high and weak fits out of the network.' },
  { t: 'Private by default', d: 'Your answers are shared only with your matched attorney, never listed publicly.' }
];
const badgeCards = badges.map(function (b) {
  return [
    '<div class="dl-card" style="padding:22px">',
    '  <div style="display:flex;gap:14px;align-items:flex-start">',
    '    <div class="dl-ico" style="flex:none">' + ICONS.shield + '</div>',
    '    <div><h3 style="margin:0 0 6px">' + esc(b.t) + '</h3><p>' + esc(b.d) + '</p></div>',
    '  </div>',
    '</div>'
  ].join('\n');
}).join('\n');

// Coverage map matrix: location cards with interactive tag components
const matrixCards = locations.map(function (location) {
  const lName = nameOf(location);
  const lSlug = slugOf(location);

  const nicheChips = niches.map(function (niche) {
    return '<a class="dl-chip dl-chip-hot" href="' + esc('/' + lSlug + '/' + slugOf(niche) + '/') + '">' + esc(nameOf(niche)) + '</a>';
  }).join('\n');

  const suburbs = suburbsOf(location);
  const suburbBlock = suburbs.length === 0 ? '' : [
    '<div style="margin-top:16px">',
    '  <div style="font-size:11.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#64748b;margin-bottom:8px">Neighborhoods</div>',
    '  <div class="dl-chips">',
    suburbs.map(function (s) {
      return '<a class="dl-chip" href="' + esc('/' + lSlug + '/' + firstNicheSlug + '/') + '">' + esc(nameOf(s)) + '</a>';
    }).join('\n'),
    '  </div>',
    '</div>'
  ].join('\n');

  return [
    '<div class="dl-card" style="padding:24px">',
    '  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">',
    '    <span class="dl-dot"></span>',
    '    <h3 style="margin:0;font-size:19px">' + esc(lName) + '</h3>',
    '  </div>',
    '  <div style="font-size:11.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#64748b;margin-bottom:8px">Practice areas</div>',
    '  <div class="dl-chips">',
    nicheChips,
    '  </div>',
    suburbBlock,
    '</div>'
  ].join('\n');
}).join('\n');

// Footer links
const footerLocationLinks = locations.slice(0, 8).map(function (location) {
  return '<a href="' + esc('/' + slugOf(location) + '/' + firstNicheSlug + '/') + '">' + esc(nameOf(location)) + '</a>';
}).join('\n');

const footerNicheLinks = niches.slice(0, 8).map(function (niche) {
  return '<a href="' + esc('/' + slugOf(locations[0]) + '/' + slugOf(niche) + '/') + '">' + esc(nameOf(niche)) + '</a>';
}).join('\n');

const stats = [
  { v: String(pageCount), l: 'Local match pages' },
  { v: String(locations.length), l: 'Markets covered' },
  { v: String(niches.length), l: 'Practice hubs' },
  { v: 'Under 15 min', l: 'Typical match time' }
];
const statsHTML = stats.map(function (s) {
  return [
    '<div style="text-align:center;padding:6px 10px">',
    '  <div style="font-size:clamp(24px,3vw,34px);font-weight:800;color:#fff;letter-spacing:-.02em">' + esc(s.v) + '</div>',
    '  <div style="font-size:13px;color:#94a3b8;margin-top:2px">' + esc(s.l) + '</div>',
    '</div>'
  ].join('\n');
}).join('\n');

/* ---------------------------------------------------------------
   3. Homepage
   --------------------------------------------------------------- */

const homeTitle = 'DenverLegalAI | Find a Vetted Attorney in Denver and Across Colorado';
const homeDesc = 'DenverLegalAI matches individuals and businesses with verified Colorado attorneys across ' +
  niches.length + ' practice areas and ' + locations.length + ' markets. Free, confidential, and fast.';

const homeHTML = [
  '<!DOCTYPE html>',
  '<html lang="en" class="dark">',
  '<head>',
  headCommon(homeTitle, homeDesc, SITE_URL + '/'),
  '<style>',
  BASE_CSS,
  '.hp-split{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}',
  '.hp-sticky{position:sticky;top:96px}',
  '.hp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:900px;margin:44px auto 0;padding:22px;',
  '  border-radius:18px;background:rgba(13,20,36,.8);border:1px solid #1e293b;box-shadow:0 20px 50px -20px rgba(0,0,0,.8)}',
  '.hp-hubs{display:grid;grid-template-columns:1fr 1fr;gap:18px}',
  '.hp-matrix{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:38px}',
  '.hp-cta{position:relative;overflow:hidden;text-align:center;padding:54px 24px;border-radius:24px;',
  '  background:linear-gradient(135deg,rgba(37,99,235,.28),rgba(79,70,229,.2));border:1px solid rgba(96,165,250,.3)}',
  '@media (max-width:1000px){.hp-matrix{grid-template-columns:repeat(2,1fr)}}',
  '@media (max-width:900px){.hp-split{grid-template-columns:1fr;gap:30px}.hp-sticky{position:static}.hp-hubs{grid-template-columns:1fr}',
  '  .hp-stats{grid-template-columns:repeat(2,1fr)}}',
  '@media (max-width:620px){.hp-matrix{grid-template-columns:1fr}}',
  '</style>',
  '</head>',
  '<body>',

  '<header class="dl-header">',
  '  <div class="dl-wrap dl-header-in">',
  '    <a href="/" class="dl-logo"><div class="dl-logo-mark">' + ICONS.scale + '</div><span>Denver<em>Legal</em>AI</span></a>',
  '    <nav class="dl-nav">',
  '      <a href="#hubs" class="dl-hide-sm">Practice Areas</a>',
  '      <a href="#verified" class="dl-hide-sm">Verification</a>',
  '      <a href="#coverage" class="dl-hide-sm">Coverage</a>',
  '      <a href="/' + esc(slugOf(locations[0])) + '/' + esc(firstNicheSlug) + '/" class="dl-btn dl-btn-sm">Get Matched</a>',
  '    </nav>',
  '  </div>',
  '</header>',

  '<main>',
  '<section class="dl-hero" style="padding-bottom:60px">',
  '  <div class="dl-grid-bg"></div>',
  '  <div class="dl-glow" style="width:520px;height:520px;left:-160px;top:-60px;background:rgba(37,99,235,.3)"></div>',
  '  <div class="dl-glow" style="width:460px;height:460px;right:-140px;top:60px;background:rgba(79,70,229,.26)"></div>',
  '  <div class="dl-wrap" style="position:relative">',
  '    <span class="dl-pill"><span class="dl-dot"></span>Now matching clients across Colorado</span>',
  '    <h1>The smarter way to find the <span class="dl-grad">right attorney</span></h1>',
  '    <p class="dl-lead">DenverLegalAI pairs you with verified local counsel in minutes. Answer three quick questions and get a confidential, no-obligation match.</p>',
  '    <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:26px">',
  '      <a href="#hubs" class="dl-btn">Explore practice areas &rarr;</a>',
  '      <a href="#coverage" class="dl-btn dl-btn-ghost">Browse the coverage map</a>',
  '    </div>',
  '    <div class="dl-trust">',
  '      <span class="dl-trust-item">' + ICONS.check + 'Bar-verified attorneys</span>',
  '      <span class="dl-trust-item">' + ICONS.check + 'Free to request</span>',
  '      <span class="dl-trust-item">' + ICONS.check + 'Confidential matching</span>',
  '    </div>',
  '    <div class="hp-stats">',
       statsHTML,
  '    </div>',
  '  </div>',
  '</section>',

  '<hr class="dl-divider">',
  '<section class="dl-section" id="hubs">',
  '  <div class="dl-wrap">',
  '    <div class="hp-split">',
  '      <div class="hp-sticky">',
  '        <div class="dl-eyebrow">Active legal hubs</div>',
  '        <h2 class="dl-h2">Specialists for the matters that matter most</h2>',
  '        <p class="dl-sub">Each hub is staffed by licensed attorneys who focus on that field. Pick an area to start your match, or browse every market below.</p>',
  '        <div style="margin-top:26px"><a href="#coverage" class="dl-btn">See local coverage</a></div>',
  '      </div>',
  '      <div class="hp-hubs">',
         hubCards,
  '      </div>',
  '    </div>',
  '  </div>',
  '</section>',

  '<section class="dl-section" id="verified" style="padding-top:10px">',
  '  <div class="dl-wrap">',
  '    <div class="dl-center">',
  '      <div class="dl-eyebrow">Verification</div>',
  '      <h2 class="dl-h2">Every attorney is vetted before you ever see a name</h2>',
  '      <p class="dl-sub">Trust is the product. Our screening process keeps the network small, credentialed, and accountable.</p>',
  '    </div>',
  '    <div class="dl-grid2">',
       badgeCards,
  '    </div>',
  '  </div>',
  '</section>',

  '<section class="dl-section" id="coverage" style="padding-top:10px">',
  '  <div class="dl-wrap">',
  '    <div class="dl-center">',
  '      <div class="dl-eyebrow">Coverage map</div>',
  '      <h2 class="dl-h2">Local matching, market by market</h2>',
  '      <p class="dl-sub">Select any practice area or neighborhood tag to jump straight to that local match page.</p>',
  '    </div>',
  '    <div class="hp-matrix">',
       matrixCards,
  '    </div>',
  '  </div>',
  '</section>',

  '<section class="dl-section" style="padding-top:10px">',
  '  <div class="dl-wrap">',
  '    <div class="hp-cta">',
  '      <div class="dl-glow" style="width:360px;height:360px;left:50%;top:-180px;transform:translateX(-50%);background:rgba(96,165,250,.35)"></div>',
  '      <div style="position:relative">',
  '        <h2 class="dl-h2" style="margin-bottom:12px">Ready to speak with the right attorney?</h2>',
  '        <p class="dl-sub" style="margin:0 auto 26px">It takes less than two minutes and costs nothing to find out who fits your case.</p>',
  '        <a href="/' + esc(slugOf(locations[0])) + '/' + esc(firstNicheSlug) + '/" class="dl-btn">Start my free match &rarr;</a>',
  '      </div>',
  '    </div>',
  '  </div>',
  '</section>',
  '</main>',

  '<footer class="dl-footer">',
  '  <div class="dl-wrap">',
  '    <div class="dl-foot-grid">',
  '      <div><a href="/" class="dl-logo" style="padding:0"><div class="dl-logo-mark">' + ICONS.scale + '</div><span>Denver<em>Legal</em>AI</span></a>',
  '        <p style="margin-top:14px;font-size:14px;max-width:340px">Intelligent attorney matching for individuals and businesses across Colorado.</p></div>',
  '      <div><h4>Markets</h4>',
       footerLocationLinks,
  '      </div>',
  '      <div><h4>Practice areas</h4>',
       footerNicheLinks,
  '      </div>',
  '    </div>',
  '    <p class="dl-disclaimer">denverlegalai.com is an attorney matching service and is not a law firm. Information on this site is for general purposes only and is not legal advice. Submitting a request does not create an attorney-client relationship. Attorney advertising may apply.</p>',
  '  </div>',
  '</footer>',
  '</body>',
  '</html>'
].join('\n');

writeFile(path.join(DIST, 'index.html'), homeHTML);

/* ---------------------------------------------------------------
   4. sitemap.xml and robots.txt
   --------------------------------------------------------------- */

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  sitemapUrls.map(function (u) {
    return '  <url><loc>' + esc(u) + '</loc></url>';
  }).join('\n'),
  '</urlset>'
].join('\n');

writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
writeFile(path.join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + '/sitemap.xml\n');

console.log('Build complete: ' + pageCount + ' match pages + homepage written to ' + DIST);