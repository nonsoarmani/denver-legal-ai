'use strict';

/* =====================================================================
   template.js
   Exports ONE function: renderPage(niche, location) -> full HTML string.
   Helpers and the shared CSS are attached as properties of that function
   so generate.js can reuse them (consistent design across all pages).
   ===================================================================== */

var SITE = 'denverlegalai.com';
var SITE_URL = 'https://denverlegalai.com';

/* ---------- helpers ---------- */

function esc(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function nameOf(item) {
  if (item === undefined || item === null) return '';
  if (typeof item === 'string') return item;
  return item.name || item.title || item.label || item.city || item.niche || '';
}

function slugOf(item) {
  if (item && typeof item === 'object' && item.slug) return String(item.slug);
  return slugify(nameOf(item));
}

function descOf(item) {
  if (item && typeof item === 'object') {
    return item.description || item.summary || item.blurb || '';
  }
  return '';
}

/* ---------- shared CSS (custom fallbacks, work even if Tailwind lags) ---------- */

var BASE_CSS = [
  ':root{',
  '  --bg:#070a12; --bg-2:#0b1020; --card:#0d1424; --card-2:#111a2e;',
  '  --line:#1e293b; --line-2:#2a3a55;',
  '  --text:#ffffff; --muted:#94a3b8; --muted-2:#64748b;',
  '  --brand:#2563eb; --brand-2:#4f46e5; --brand-3:#60a5fa;',
  '  --ok:#22c55e; --warn:#f59e0b;',
  '  --radius:18px;',
  '}',
  '*,*::before,*::after{box-sizing:border-box}',
  'html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}',
  'body{margin:0;background:var(--bg);color:var(--muted);',
  '  font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;',
  '  line-height:1.6;-webkit-font-smoothing:antialiased;min-height:100vh;overflow-x:hidden;',
  '  background-image:',
  '    radial-gradient(900px 500px at 15% -10%,rgba(37,99,235,.22),transparent 60%),',
  '    radial-gradient(800px 500px at 90% 0%,rgba(79,70,229,.18),transparent 55%),',
  '    linear-gradient(180deg,#070a12 0%,#070a12 100%);',
  '  background-repeat:no-repeat}',
  'a{color:inherit;text-decoration:none}',
  'h1,h2,h3,h4{color:var(--text);margin:0;letter-spacing:-.02em;line-height:1.1}',
  'p{margin:0}',
  '.dl-wrap{max-width:1180px;margin:0 auto;padding:0 24px}',
  '.dl-grid-bg{position:absolute;inset:0;pointer-events:none;opacity:.5;',
  '  background-image:linear-gradient(rgba(148,163,184,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.06) 1px,transparent 1px);',
  '  background-size:56px 56px;',
  '  -webkit-mask-image:radial-gradient(ellipse at 50% 0%,#000 30%,transparent 75%);mask-image:radial-gradient(ellipse at 50% 0%,#000 30%,transparent 75%)}',
  '.dl-glow{position:absolute;border-radius:9999px;filter:blur(90px);pointer-events:none}',

  /* header */
  '.dl-header{position:sticky;top:0;z-index:50;background:rgba(7,10,18,.72);',
  '  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}',
  '.dl-header-in{display:flex;align-items:center;justify-content:space-between;height:68px}',
  '.dl-logo{display:flex;align-items:center;gap:10px;color:#fff;font-weight:800;font-size:18px;letter-spacing:-.02em}',
  '.dl-logo-mark{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;',
  '  background:linear-gradient(135deg,#2563eb,#4f46e5);box-shadow:0 0 24px rgba(37,99,235,.55),inset 0 1px 0 rgba(255,255,255,.3)}',
  '.dl-logo-mark svg{width:18px;height:18px}',
  '.dl-logo span em{font-style:normal;color:var(--brand-3)}',
  '.dl-nav{display:flex;align-items:center;gap:28px;font-size:14px;font-weight:500}',
  '.dl-nav a{color:var(--muted);transition:color .2s}',
  '.dl-nav a:hover{color:#fff}',

  /* buttons */
  '.dl-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;cursor:pointer;',
  '  font:inherit;font-weight:700;font-size:15px;color:#fff;padding:13px 22px;border-radius:12px;',
  '  background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);',
  '  box-shadow:0 8px 24px -6px rgba(37,99,235,.65),inset 0 1px 0 rgba(255,255,255,.22);',
  '  transition:transform .18s ease,box-shadow .18s ease,filter .18s ease}',
  '.dl-btn:hover{transform:translateY(-1px);filter:brightness(1.08);box-shadow:0 12px 30px -6px rgba(37,99,235,.8),inset 0 1px 0 rgba(255,255,255,.28)}',
  '.dl-btn:active{transform:translateY(0)}',
  '.dl-btn-sm{padding:9px 16px;font-size:13px;border-radius:10px}',
  '.dl-btn-ghost{background:rgba(15,23,42,.7);border:1px solid var(--line-2);box-shadow:none;color:#e2e8f0}',
  '.dl-btn-ghost:hover{background:rgba(30,41,59,.9);box-shadow:none;filter:none}',
  '.dl-btn[disabled]{opacity:.45;cursor:not-allowed;transform:none;filter:none}',

  /* badges */
  '.dl-pill{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:9999px;font-size:12.5px;font-weight:600;',
  '  color:#bfdbfe;background:rgba(37,99,235,.12);border:1px solid rgba(96,165,250,.28)}',
  '.dl-dot{width:7px;height:7px;border-radius:9999px;background:var(--ok);box-shadow:0 0 10px var(--ok)}',
  '.dl-trust{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}',
  '.dl-trust-item{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;',
  '  color:#cbd5e1;background:rgba(13,20,36,.8);border:1px solid var(--line)}',
  '.dl-trust-item svg{width:16px;height:16px;color:var(--ok);flex:none}',

  /* hero */
  '.dl-hero{position:relative;padding:76px 0 40px;text-align:center;overflow:hidden}',
  '.dl-hero h1{font-size:clamp(34px,5.4vw,62px);font-weight:800;margin:22px auto 18px;max-width:880px}',
  '.dl-grad{background:linear-gradient(90deg,#60a5fa 0%,#818cf8 50%,#a78bfa 100%);-webkit-background-clip:text;background-clip:text;',
  '  -webkit-text-fill-color:transparent;color:transparent}',
  '.dl-lead{font-size:clamp(16px,1.9vw,19px);max-width:700px;margin:0 auto 26px;color:var(--muted)}',

  /* questionnaire card */
  '.dl-qwrap{position:relative;max-width:680px;margin:34px auto 0;padding:0 4px}',
  '.dl-qglow{position:absolute;left:50%;top:50%;width:90%;height:90%;transform:translate(-50%,-50%);',
  '  background:radial-gradient(closest-side,rgba(37,99,235,.45),transparent);filter:blur(60px);z-index:0;pointer-events:none}',
  '.dl-qcard{position:relative;z-index:1;text-align:left;border-radius:22px;padding:30px;',
  '  background:linear-gradient(180deg,rgba(17,26,46,.96),rgba(10,15,28,.98));',
  '  border:1px solid var(--line-2);',
  '  box-shadow:0 30px 80px -20px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.03) inset,0 1px 0 rgba(255,255,255,.07) inset}',
  '.dl-qhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}',
  '.dl-qtag{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--brand-3)}',
  '.dl-qcount{font-size:12.5px;color:var(--muted-2);font-weight:600}',
  '.dl-bar{height:6px;border-radius:9999px;background:#0f172a;border:1px solid var(--line);overflow:hidden;margin-bottom:24px}',
  '.dl-bar-fill{height:100%;width:33.33%;border-radius:9999px;background:linear-gradient(90deg,#2563eb,#818cf8);',
  '  box-shadow:0 0 14px rgba(99,102,241,.8);transition:width .35s ease}',
  '.dl-qtitle{font-size:24px;font-weight:800;margin-bottom:6px}',
  '.dl-qsub{font-size:14.5px;color:var(--muted);margin-bottom:20px}',
  '.dl-step{display:none;animation:dlFade .35s ease}',
  '.dl-step.is-active{display:block}',
  '@keyframes dlFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
  '.dl-opts{display:grid;gap:10px}',
  '.dl-opt{display:flex;align-items:center;gap:14px;width:100%;text-align:left;cursor:pointer;font:inherit;color:#e2e8f0;',
  '  padding:15px 16px;border-radius:14px;background:rgba(15,23,42,.7);border:1px solid var(--line);',
  '  transition:border-color .18s,background .18s,transform .18s,box-shadow .18s}',
  '.dl-opt:hover{border-color:var(--line-2);background:rgba(30,41,59,.7);transform:translateY(-1px)}',
  '.dl-opt.is-selected{border-color:var(--brand);background:rgba(37,99,235,.14);box-shadow:0 0 0 3px rgba(37,99,235,.22)}',
  '.dl-radio{width:20px;height:20px;border-radius:9999px;border:2px solid #334155;flex:none;position:relative;transition:all .18s}',
  '.dl-opt.is-selected .dl-radio{border-color:var(--brand-3);background:var(--brand)}',
  '.dl-opt.is-selected .dl-radio::after{content:"";position:absolute;inset:4px;border-radius:9999px;background:#fff}',
  '.dl-opt-t{font-weight:700;font-size:15px;color:#fff;display:block}',
  '.dl-opt-d{font-size:13px;color:var(--muted);display:block;margin-top:1px}',
  '.dl-field{margin-bottom:16px}',
  '.dl-label{display:block;font-size:13px;font-weight:700;color:#cbd5e1;margin-bottom:7px}',
  '.dl-input,.dl-select,.dl-textarea{width:100%;font:inherit;font-size:15px;color:#fff;padding:13px 14px;border-radius:12px;',
  '  background:#0a1020;border:1px solid var(--line-2);outline:none;transition:border-color .18s,box-shadow .18s}',
  '.dl-textarea{min-height:104px;resize:vertical}',
  '.dl-input::placeholder,.dl-textarea::placeholder{color:#475569}',
  '.dl-input:focus,.dl-select:focus,.dl-textarea:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(37,99,235,.28)}',
  '.dl-select option{background:#0a1020;color:#fff}',
  '.dl-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}',
  '.dl-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:22px}',
  '.dl-err{display:none;margin-top:12px;font-size:13px;font-weight:600;color:#fca5a5}',
  '.dl-err.is-on{display:block}',
  '.dl-fine{font-size:12px;color:var(--muted-2);margin-top:14px;line-height:1.5}',
  '.dl-success{display:none;text-align:center;padding:18px 6px 6px}',
  '.dl-success.is-on{display:block;animation:dlFade .4s ease}',
  '.dl-check{width:64px;height:64px;border-radius:9999px;margin:0 auto 16px;display:grid;place-items:center;',
  '  background:rgba(34,197,94,.14);border:1px solid rgba(34,197,94,.4);box-shadow:0 0 30px rgba(34,197,94,.3)}',
  '.dl-check svg{width:30px;height:30px;color:var(--ok)}',

  /* sections */
  '.dl-section{position:relative;padding:72px 0}',
  '.dl-eyebrow{font-size:12.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--brand-3);margin-bottom:12px}',
  '.dl-h2{font-size:clamp(26px,3.6vw,40px);font-weight:800;margin-bottom:14px}',
  '.dl-sub{max-width:660px;color:var(--muted);font-size:16.5px}',
  '.dl-center{text-align:center}',
  '.dl-center .dl-sub{margin-left:auto;margin-right:auto}',
  '.dl-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:38px}',
  '.dl-grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:38px}',
  '.dl-card{position:relative;padding:26px;border-radius:var(--radius);',
  '  background:linear-gradient(180deg,rgba(17,26,46,.8),rgba(11,16,32,.9));border:1px solid var(--line);',
  '  box-shadow:0 10px 30px -14px rgba(0,0,0,.7);transition:border-color .2s,transform .2s,box-shadow .2s}',
  '.dl-card:hover{border-color:var(--line-2);transform:translateY(-3px);box-shadow:0 22px 50px -18px rgba(37,99,235,.35)}',
  '.dl-card h3{font-size:18px;font-weight:700;margin:14px 0 8px}',
  '.dl-card p{font-size:14.5px;color:var(--muted)}',
  '.dl-ico{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;color:#bfdbfe;',
  '  background:linear-gradient(135deg,rgba(37,99,235,.3),rgba(79,70,229,.22));border:1px solid rgba(96,165,250,.3)}',
  '.dl-ico svg{width:22px;height:22px}',
  '.dl-num{font-size:13px;font-weight:800;color:var(--brand-3);letter-spacing:.08em}',
  '.dl-divider{height:1px;background:linear-gradient(90deg,transparent,var(--line-2),transparent);border:0;margin:0}',

  /* faq */
  '.dl-faq{max-width:820px;margin:38px auto 0;display:grid;gap:12px}',
  '.dl-faq details{border-radius:14px;background:rgba(13,20,36,.85);border:1px solid var(--line);padding:0 20px}',
  '.dl-faq summary{cursor:pointer;list-style:none;padding:18px 0;color:#fff;font-weight:700;font-size:16px;display:flex;justify-content:space-between;gap:12px}',
  '.dl-faq summary::-webkit-details-marker{display:none}',
  '.dl-faq summary::after{content:"+";color:var(--brand-3);font-size:22px;line-height:1}',
  '.dl-faq details[open] summary::after{content:"\\2212"}',
  '.dl-faq details p{padding:0 0 18px;color:var(--muted);font-size:15px}',

  /* chips / tags */
  '.dl-chips{display:flex;flex-wrap:wrap;gap:8px}',
  '.dl-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:9999px;font-size:13px;font-weight:600;',
  '  color:#cbd5e1;background:rgba(15,23,42,.9);border:1px solid var(--line-2);transition:all .18s}',
  '.dl-chip:hover{color:#fff;border-color:var(--brand);background:rgba(37,99,235,.2);box-shadow:0 0 18px rgba(37,99,235,.35);transform:translateY(-1px)}',
  '.dl-chip-hot{color:#bfdbfe;border-color:rgba(96,165,250,.4);background:rgba(37,99,235,.14)}',

  /* breadcrumb */
  '.dl-crumbs{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;font-size:13px;color:var(--muted-2);font-weight:500}',
  '.dl-crumbs a:hover{color:#fff}',

  /* footer */
  '.dl-footer{border-top:1px solid var(--line);background:rgba(5,8,15,.7);padding:46px 0 36px;margin-top:30px}',
  '.dl-foot-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:34px}',
  '.dl-foot-grid h4{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#cbd5e1;margin-bottom:14px}',
  '.dl-foot-grid a{display:block;font-size:14px;color:var(--muted);padding:4px 0}',
  '.dl-foot-grid a:hover{color:#fff}',
  '.dl-disclaimer{margin-top:30px;padding-top:22px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted-2);line-height:1.65}',

  /* responsive */
  '@media (max-width:900px){',
  '  .dl-grid3{grid-template-columns:1fr}',
  '  .dl-grid2{grid-template-columns:1fr}',
  '  .dl-foot-grid{grid-template-columns:1fr}',
  '  .dl-nav a.dl-hide-sm{display:none}',
  '}',
  '@media (max-width:560px){',
  '  .dl-row2{grid-template-columns:1fr}',
  '  .dl-qcard{padding:22px 18px}',
  '  .dl-hero{padding-top:54px}',
  '}'
].join('\n');

var SHIELD_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>';
var SCALE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 7h14M5 7l-3 7a3.5 3.5 0 006 0L5 7zM19 7l-3 7a3.5 3.5 0 006 0l-3-7z"/></svg>';
var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';

function headCommon(title, description, canonical) {
  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + esc(title) + '</title>',
    '<meta name="description" content="' + esc(description) + '">',
    '<meta name="theme-color" content="#070a12">',
    '<link rel="canonical" href="' + esc(canonical) + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="' + esc(title) + '">',
    '<meta property="og:description" content="' + esc(description) + '">',
    '<meta property="og:url" content="' + esc(canonical) + '">',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">',
    '<script src="https://cdn.tailwindcss.com"></script>',
    '<script>',
    '  try { if (typeof tailwind !== "undefined") { tailwind.config = { darkMode: "class", theme: { extend: {',
    '    colors: { brand: { DEFAULT: "#2563eb", 600: "#2563eb", 500: "#3b82f6", 400: "#60a5fa" }, ink: "#070a12" },',
    '    fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] } } } }; } } catch (e) {}',
    '</script>'
  ].join('\n');
}

/* ---------- page renderer ---------- */

function renderPage(niche, location) {
  var nicheName = nameOf(niche) || 'Legal Help';
  var nicheSlug = slugOf(niche) || 'legal-help';
  var nicheDesc = descOf(niche);
  var locName = nameOf(location) || 'Denver';
  var locSlug = slugOf(location) || 'denver';

  var pageTitle = nicheName + ' Lawyers in ' + locName + ' | Free Attorney Matching | DenverLegalAI';
  var pageDesc = 'Get matched with a vetted ' + nicheName.toLowerCase() + ' attorney in ' + locName +
    '. Answer three quick questions and receive a confidential, no-obligation match in less than 15 minutes.';
  var canonical = SITE_URL + '/' + locSlug + '/' + nicheSlug + '/';

  var intro = nicheDesc ||
    ('Facing a ' + nicheName.toLowerCase() + ' matter in ' + locName + '? Our matching engine reviews your situation and connects you with a licensed local attorney whose experience fits your case.');

  var ld = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: 'DenverLegalAI - ' + nicheName + ' in ' + locName,
    url: canonical,
    areaServed: locName,
    description: pageDesc
  };
  var ldJson = JSON.stringify(ld).replace(/</g, '\\u003c');

  var options = [
    { t: 'I need help right now', d: 'There is an urgent deadline, hearing or active dispute.', v: 'urgent' },
    { t: 'I am exploring my options', d: 'I want to understand my rights before taking action.', v: 'exploring' },
    { t: 'I am comparing attorneys', d: 'I already know what I need and want the right fit.', v: 'comparing' },
    { t: 'I was referred here', d: 'Someone suggested I speak with a specialist.', v: 'referred' }
  ];

  var optionsHTML = options.map(function (o) {
    return [
      '<button type="button" class="dl-opt" data-value="' + esc(o.v) + '" data-label="' + esc(o.t) + '">',
      '  <span class="dl-radio"></span>',
      '  <span><span class="dl-opt-t">' + esc(o.t) + '</span><span class="dl-opt-d">' + esc(o.d) + '</span></span>',
      '</button>'
    ].join('\n');
  }).join('\n');

  var steps = [
    { n: '01', t: 'Tell us what happened', d: 'Three short questions about your ' + nicheName.toLowerCase() + ' situation. No legal jargon, no account needed.' },
    { n: '02', t: 'We screen and match', d: 'Our engine compares your answers against vetted attorneys practicing in ' + locName + '.' },
    { n: '03', t: 'Speak with counsel', d: 'A matched attorney reaches out to you directly, usually the same business day.' }
  ];
  var stepsHTML = steps.map(function (s) {
    return [
      '<div class="dl-card">',
      '  <div class="dl-num">STEP ' + esc(s.n) + '</div>',
      '  <h3>' + esc(s.t) + '</h3>',
      '  <p>' + esc(s.d) + '</p>',
      '</div>'
    ].join('\n');
  }).join('\n');

  var perks = [
    { t: 'Vetted local attorneys', d: 'Every attorney is license-checked and reviewed before joining the ' + locName + ' network.' },
    { t: 'Confidential by design', d: 'Your answers are used only to find your match and are never sold or shared publicly.' },
    { t: 'No cost to request', d: 'Matching is free. You decide whether to hire anyone after a consultation.' }
  ];
  var perksHTML = perks.map(function (p) {
    return [
      '<div class="dl-card">',
      '  <div class="dl-ico">' + SHIELD_SVG + '</div>',
      '  <h3>' + esc(p.t) + '</h3>',
      '  <p>' + esc(p.d) + '</p>',
      '</div>'
    ].join('\n');
  }).join('\n');

  var faqs = [
    { q: 'How fast will I hear from an attorney?', a: 'Most ' + locName + ' requests are matched in less than 15 minutes during business hours, and attorneys typically follow up the same day.' },
    { q: 'Does it cost anything to get matched?', a: 'No. Submitting the questionnaire is free and carries no obligation. Any fee arrangement is agreed directly between you and the attorney.' },
    { q: 'Is my information private?', a: 'Yes. Your details are shared only with the attorney selected for your match and are handled under strict confidentiality practices.' },
    { q: 'Is DenverLegalAI a law firm?', a: 'No. DenverLegalAI is a matching platform and does not provide legal advice or create an attorney-client relationship.' }
  ];
  var faqHTML = faqs.map(function (f) {
    return '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
  }).join('\n');

  var clientScript = [
    '(function () {',
    '  var root = document.getElementById("dl-q");',
    '  if (!root) { return; }',
    '  var steps = Array.prototype.slice.call(root.querySelectorAll(".dl-step"));',
    '  var fill = root.querySelector(".dl-bar-fill");',
    '  var count = root.querySelector(".dl-qcount");',
    '  var err = root.querySelector(".dl-err");',
    '  var success = root.querySelector(".dl-success");',
    '  var shell = root.querySelector(".dl-shell");',
    '  var current = 1;',
    '  var total = steps.length;',
    '  var answers = { situation: "", timeline: "", details: "", name: "", email: "", phone: "" };',
    '',
    '  function show(n) {',
    '    current = n;',
    '    steps.forEach(function (el, idx) {',
    '      if (idx + 1 === n) { el.classList.add("is-active"); } else { el.classList.remove("is-active"); }',
    '    });',
    '    fill.style.width = String((n / total) * 100) + "%";',
    '    count.textContent = "Step " + n + " of " + total;',
    '    err.classList.remove("is-on");',
    '  }',
    '  function fail(msg) { err.textContent = msg; err.classList.add("is-on"); }',
    '',
    '  root.querySelectorAll(".dl-opt").forEach(function (btn) {',
    '    btn.addEventListener("click", function () {',
    '      root.querySelectorAll(".dl-opt").forEach(function (b) { b.classList.remove("is-selected"); });',
    '      btn.classList.add("is-selected");',
    '      answers.situation = btn.getAttribute("data-label");',
    '      err.classList.remove("is-on");',
    '    });',
    '  });',
    '',
    '  root.querySelectorAll("[data-next]").forEach(function (btn) {',
    '    btn.addEventListener("click", function () {',
    '      if (current === 1 && !answers.situation) { fail("Please choose the option that fits best."); return; }',
    '      if (current === 2) {',
    '        answers.timeline = root.querySelector("#dl-timeline").value;',
    '        answers.details = root.querySelector("#dl-details").value.trim();',
    '        if (!answers.timeline) { fail("Please select a timeline."); return; }',
    '      }',
    '      if (current !== total) { show(current + 1); }',
    '    });',
    '  });',
    '  root.querySelectorAll("[data-back]").forEach(function (btn) {',
    '    btn.addEventListener("click", function () { if (current !== 1) { show(current - 1); } });',
    '  });',
    '',
    '  var form = root.querySelector("form");',
    '  form.addEventListener("submit", function (ev) {',
    '    ev.preventDefault();',
    '    answers.name = root.querySelector("#dl-name").value.trim();',
    '    answers.email = root.querySelector("#dl-email").value.trim();',
    '    answers.phone = root.querySelector("#dl-phone").value.trim();',
    '    var okEmail = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(answers.email);',
    '    if (!answers.name) { fail("Please enter your full name."); return; }',
    '    if (!okEmail) { fail("Please enter a valid email address."); return; }',
    '    var nicheLabel = root.getAttribute("data-niche");',
    '    var locationLabel = root.getAttribute("data-location");',
    '    var payload = {',
    '      name: answers.name,',
    '      email: answers.email,',
    '      phone: answers.phone,',
    '      practice_area: nicheLabel,',
    '      location: locationLabel,',
    '      situation: answers.situation,',
    '      timeline: answers.timeline,',
    '      details: answers.details,',
    '      page_url: window.location.href,',
    '      _subject: "New " + nicheLabel + " lead - " + locationLabel',
    '    };',
    '    var submitBtn = form.querySelector("button[type=submit]");',
    '    var originalLabel = submitBtn.textContent;',
    '    submitBtn.disabled = true;',
    '    submitBtn.textContent = "Sending...";',
    '    err.classList.remove("is-on");',
    '',
    '    fetch("https://formspree.io/f/xzeevndb", {',
    '      method: "POST",',
    '      headers: { "Accept": "application/json", "Content-Type": "application/json" },',
    '      body: JSON.stringify(payload)',
    '    }).then(function (res) {',
    '      if (res.ok) {',
    '        shell.style.display = "none";',
    '        success.classList.add("is-on");',
    '        fill.style.width = "100%";',
    '        count.textContent = "Complete";',
    '      } else {',
    '        submitBtn.disabled = false;',
    '        submitBtn.textContent = originalLabel;',
    '        fail("We could not send your request. Please check your details and try again.");',
    '      }',
    '    }).catch(function () {',
    '      submitBtn.disabled = false;',
    '      submitBtn.textContent = originalLabel;',
    '      fail("Network error. Please check your connection and try again.");',
    '    });',
    '  });',
    '})();'
  ].join('\n');

  return [
    '<!DOCTYPE html>',
    '<html lang="en" class="dark">',
    '<head>',
    headCommon(pageTitle, pageDesc, canonical),
    '<script type="application/ld+json">' + ldJson + '</script>',
    '<style>',
    BASE_CSS,
    '</style>',
    '</head>',
    '<body>',

    '<header class="dl-header">',
    '  <div class="dl-wrap dl-header-in">',
    '    <a href="/" class="dl-logo"><div class="dl-logo-mark">' + SCALE_SVG + '</div><span>Denver<em>Legal</em>AI</span></a>',
    '    <nav class="dl-nav">',
    '      <a href="/#hubs" class="dl-hide-sm">Practice Areas</a>',
    '      <a href="/#coverage" class="dl-hide-sm">Coverage</a>',
    '      <a href="#match" class="dl-btn dl-btn-sm">Get Matched</a>',
    '    </nav>',
    '  </div>',
    '</header>',

    '<main>',
    '<section class="dl-hero">',
    '  <div class="dl-grid-bg"></div>',
    '  <div class="dl-glow" style="width:420px;height:420px;left:-120px;top:40px;background:rgba(37,99,235,.28)"></div>',
    '  <div class="dl-glow" style="width:380px;height:380px;right:-100px;top:120px;background:rgba(79,70,229,.24)"></div>',
    '  <div class="dl-wrap" style="position:relative">',
    '    <div class="dl-crumbs"><a href="/">Home</a><span>/</span><span>' + esc(locName) + '</span><span>/</span><span style="color:#cbd5e1">' + esc(nicheName) + '</span></div>',
    '    <div style="margin-top:22px"><span class="dl-pill"><span class="dl-dot"></span>Attorneys available in ' + esc(locName) + ' today</span></div>',
    '    <h1>' + esc(nicheName) + ' lawyers in <span class="dl-grad">' + esc(locName) + '</span>, matched in minutes</h1>',
    '    <p class="dl-lead">' + esc(intro) + '</p>',
    '    <div class="dl-trust">',
    '      <span class="dl-trust-item">' + CHECK_SVG + 'License-verified attorneys</span>',
    '      <span class="dl-trust-item">' + CHECK_SVG + '100% confidential</span>',
    '      <span class="dl-trust-item">' + CHECK_SVG + 'Free, no obligation</span>',
    '    </div>',

    '    <div class="dl-qwrap" id="match">',
    '      <div class="dl-qglow"></div>',
    '      <div class="dl-qcard" id="dl-q" data-niche="' + esc(nicheName) + '" data-location="' + esc(locName) + '">',
    '        <div class="dl-qhead"><span class="dl-qtag">Free case match</span><span class="dl-qcount">Step 1 of 3</span></div>',
    '        <div class="dl-bar"><div class="dl-bar-fill"></div></div>',
    '        <div class="dl-shell">',
    '          <form novalidate>',
    '            <div class="dl-step is-active">',
    '              <h2 class="dl-qtitle">What best describes your situation?</h2>',
    '              <p class="dl-qsub">This helps us route your ' + esc(nicheName.toLowerCase()) + ' request to the right specialist.</p>',
    '              <div class="dl-opts">',
                     optionsHTML,
    '              </div>',
    '              <div class="dl-actions"><span></span><button type="button" class="dl-btn" data-next>Continue</button></div>',
    '            </div>',

    '            <div class="dl-step">',
    '              <h2 class="dl-qtitle">A little more detail</h2>',
    '              <p class="dl-qsub">Share the basics so your attorney comes prepared. Do not include sensitive details here.</p>',
    '              <div class="dl-field"><label class="dl-label" for="dl-timeline">How soon do you need counsel?</label>',
    '                <select id="dl-timeline" class="dl-select">',
    '                  <option value="">Select a timeline</option>',
    '                  <option value="Immediately">Immediately</option>',
    '                  <option value="Within a week">Within a week</option>',
    '                  <option value="Within a month">Within a month</option>',
    '                  <option value="Just researching">Just researching</option>',
    '                </select></div>',
    '              <div class="dl-field"><label class="dl-label" for="dl-details">Briefly describe your matter (optional)</label>',
    '                <textarea id="dl-details" class="dl-textarea" placeholder="A few sentences is plenty."></textarea></div>',
    '              <div class="dl-actions"><button type="button" class="dl-btn dl-btn-ghost" data-back>Back</button><button type="button" class="dl-btn" data-next>Continue</button></div>',
    '            </div>',

    '            <div class="dl-step">',
    '              <h2 class="dl-qtitle">Where should we send your match?</h2>',
    '              <p class="dl-qsub">An attorney serving ' + esc(locName) + ' will contact you directly.</p>',
    '              <div class="dl-field"><label class="dl-label" for="dl-name">Full name</label><input id="dl-name" class="dl-input" type="text" autocomplete="name" placeholder="Jane Smith"></div>',
    '              <div class="dl-row2">',
    '                <div class="dl-field"><label class="dl-label" for="dl-email">Email</label><input id="dl-email" class="dl-input" type="email" autocomplete="email" placeholder="you@email.com"></div>',
    '                <div class="dl-field"><label class="dl-label" for="dl-phone">Phone (optional)</label><input id="dl-phone" class="dl-input" type="tel" autocomplete="tel" placeholder="(303) 555-0123"></div>',
    '              </div>',
    '              <div class="dl-actions"><button type="button" class="dl-btn dl-btn-ghost" data-back>Back</button><button type="submit" class="dl-btn">Find my attorney</button></div>',
    '              <p class="dl-fine">By submitting, you agree to be contacted about your request. DenverLegalAI is not a law firm and does not give legal advice.</p>',
    '            </div>',
    '            <div class="dl-err" role="alert"></div>',
    '          </form>',
    '        </div>',
    '        <div class="dl-success">',
    '          <div class="dl-check">' + CHECK_SVG + '</div>',
    '          <h2 class="dl-qtitle">Request received</h2>',
    '          <p class="dl-qsub" style="margin-bottom:0">We are matching you with a ' + esc(nicheName.toLowerCase()) + ' attorney in ' + esc(locName) + '. Watch your inbox for an introduction.</p>',
    '        </div>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</section>',

    '<hr class="dl-divider">',
    '<section class="dl-section">',
    '  <div class="dl-wrap dl-center">',
    '    <div class="dl-eyebrow">How it works</div>',
    '    <h2 class="dl-h2">From question to counsel in three steps</h2>',
    '    <p class="dl-sub">A faster, calmer way to find a ' + esc(nicheName.toLowerCase()) + ' attorney in ' + esc(locName) + '.</p>',
    '    <div class="dl-grid3" style="text-align:left">',
         stepsHTML,
    '    </div>',
    '  </div>',
    '</section>',

    '<section class="dl-section" style="padding-top:10px">',
    '  <div class="dl-wrap dl-center">',
    '    <div class="dl-eyebrow">Why DenverLegalAI</div>',
    '    <h2 class="dl-h2">Built for trust from the first click</h2>',
    '    <div class="dl-grid3" style="text-align:left">',
         perksHTML,
    '    </div>',
    '  </div>',
    '</section>',

    '<section class="dl-section" style="padding-top:10px">',
    '  <div class="dl-wrap dl-center">',
    '    <div class="dl-eyebrow">FAQ</div>',
    '    <h2 class="dl-h2">Common questions</h2>',
    '    <div class="dl-faq" style="text-align:left">',
         faqHTML,
    '    </div>',
    '  </div>',
    '</section>',
    '</main>',

    '<footer class="dl-footer">',
    '  <div class="dl-wrap">',
    '    <div class="dl-foot-grid">',
    '      <div><a href="/" class="dl-logo" style="padding:0"><div class="dl-logo-mark">' + SCALE_SVG + '</div><span>Denver<em>Legal</em>AI</span></a>',
    '        <p style="margin-top:14px;font-size:14px;max-width:340px">Intelligent attorney matching for individuals and businesses across Colorado.</p></div>',
    '      <div><h4>Explore</h4><a href="/">Home</a><a href="/#hubs">Practice areas</a><a href="/#coverage">Coverage map</a></div>',
    '      <div><h4>This page</h4><a href="#match">' + esc(nicheName) + ' in ' + esc(locName) + '</a><a href="' + esc('/' + locSlug + '/' + nicheSlug + '/') + '">Permalink</a></div>',
    '    </div>',
    '    <p class="dl-disclaimer">' + esc(SITE) + ' is an attorney matching service and is not a law firm. Information on this site is for general purposes only and is not legal advice. Submitting a request does not create an attorney-client relationship. Attorney advertising may apply.</p>',
    '  </div>',
    '</footer>',

    '<script>',
    clientScript,
    '</script>',
    '</body>',
    '</html>'
  ].join('\n');
}

/* shared utilities for generate.js (the export itself is still one function) */
renderPage.esc = esc;
renderPage.slugify = slugify;
renderPage.nameOf = nameOf;
renderPage.slugOf = slugOf;
renderPage.descOf = descOf;
renderPage.baseCSS = BASE_CSS;
renderPage.headCommon = headCommon;
renderPage.icons = { shield: SHIELD_SVG, scale: SCALE_SVG, check: CHECK_SVG };
renderPage.SITE = SITE;
renderPage.SITE_URL = SITE_URL;

module.exports = renderPage;