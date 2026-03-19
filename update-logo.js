#!/usr/bin/env node
/**
 * update-logo.js — Sync Valuations global logo propagation
 *
 * Updates EVERY logo surface when you pick a winner from the brand guide Lab:
 *   - index.html           (nav SVG)
 *   - brands/law/faq/methodology.html  (nav SVGs — converts outlined → text-based)
 *   - floating-report.html (mark SVG)
 *   - brand-guide.html     (static HTML SVGs + svgSources JS object)
 *   - Logo Variants SV/*.svg  (8 standalone SVG files)
 *   - sv-full-logo.svg / sv-logo-mark.svg (root files)
 *   - og-image.png         (regenerated at 1200×630)
 *
 * Usage:
 *   node update-logo.js
 *      → uses default state (current logo)
 *
 *   node update-logo.js --state='{"scale":1,"sScale":0.9,"sWeight":1.5,"weight":"600","spacing":"2","wmY":0,"shape":"rect","accent":"uniform"}'
 *      → applies a specific playground state
 *
 *   node update-logo.js --state-file=logo-state.json
 *      → reads state from a JSON file
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// 0. PARSE STATE
// ─────────────────────────────────────────────────────────────

const DEFAULT_STATE = {
  scale:   1,      // mark container scale (0.6–1.2)
  sScale:  1,      // S interior scale (0.6–1.15)
  sWeight: 0,      // S stroke weight (0–3)
  weight:  '500',  // wordmark font-weight
  spacing: '2',    // letter-spacing
  wmY:     0,      // wordmark Y offset
  shape:   'rect', // rect | circle | outline | none
  accent:  'uniform', // uniform | navy | gold | bracket
};

function parseState() {
  const args = process.argv.slice(2);
  const stateArg = args.find(a => a.startsWith('--state='));
  const fileArg  = args.find(a => a.startsWith('--state-file='));
  if (fileArg) {
    const file = fileArg.slice('--state-file='.length);
    return Object.assign({}, DEFAULT_STATE, JSON.parse(fs.readFileSync(file, 'utf8')));
  }
  if (stateArg) {
    return Object.assign({}, DEFAULT_STATE, JSON.parse(stateArg.slice('--state='.length)));
  }
  return { ...DEFAULT_STATE };
}

const S = parseState();

// ─────────────────────────────────────────────────────────────
// 1. SVG PATH DATA
// ─────────────────────────────────────────────────────────────

const S_PATH = 'M35.9759 45.234C33.9479 45.234 31.9979 44.909 30.1259 44.259C28.2799 43.583 26.8499 42.725 25.8359 41.685L26.9669 39.462C27.9289 40.398 29.2159 41.191 30.8279 41.841C32.4659 42.465 34.1819 42.777 35.9759 42.777C37.6919 42.777 39.0829 42.569 40.1489 42.153C41.2409 41.711 42.0339 41.126 42.5279 40.398C43.0479 39.67 43.3079 38.864 43.3079 37.98C43.3079 36.914 42.9959 36.056 42.3719 35.406C41.7739 34.756 40.9809 34.249 39.9929 33.885C39.0049 33.495 37.9129 33.157 36.7169 32.871C35.5209 32.585 34.3249 32.286 33.1289 31.974C31.9329 31.636 30.8279 31.194 29.8139 30.648C28.8259 30.102 28.0199 29.387 27.3959 28.503C26.7979 27.593 26.4989 26.41 26.4989 24.954C26.4989 23.602 26.8499 22.367 27.5519 21.249C28.2799 20.105 29.3849 19.195 30.8669 18.519C32.3489 17.817 34.2469 17.466 36.5609 17.466C38.0949 17.466 39.6159 17.687 41.1239 18.129C42.6319 18.545 43.9319 19.13 45.0239 19.884L44.0489 22.185C42.8789 21.405 41.6309 20.833 40.3049 20.469C39.0049 20.105 37.7439 19.923 36.5219 19.923C34.8839 19.923 33.5319 20.144 32.4659 20.586C31.3999 21.028 30.6069 21.626 30.0869 22.38C29.5929 23.108 29.3459 23.94 29.3459 24.876C29.3459 25.942 29.6449 26.8 30.2429 27.45C30.8669 28.1 31.6729 28.607 32.6609 28.971C33.6749 29.335 34.7799 29.66 35.9759 29.946C37.1719 30.232 38.3549 30.544 39.5249 30.882C40.7209 31.22 41.8129 31.662 42.8009 32.208C43.8149 32.728 44.6209 33.43 45.2189 34.314C45.8429 35.198 46.1549 36.355 46.1549 37.785C46.1549 39.111 45.7909 40.346 45.0629 41.49C44.3349 42.608 43.2169 43.518 41.7089 44.22C40.2269 44.896 38.3159 45.234 35.9759 45.234Z';
const B_PATH = 'M15.483 49.566V13.062H22.62V15.363H18.252V47.265H22.62V49.566H15.483ZM56.503 49.566H49.366V47.265H53.734V15.363H49.366V13.062H56.503V49.566Z';

// ─────────────────────────────────────────────────────────────
// 2. SVG BUILDERS
// ─────────────────────────────────────────────────────────────

function markBlock(s, containerFill, sFill) {
  const ty = 31.5 * (1 - s.scale);
  const ix = 35.5, iy = 31.5;
  const intT = s.sScale !== 1
    ? ` transform="translate(${ix},${iy}) scale(${s.sScale}) translate(-${ix},-${iy})"`
    : '';
  const swAttr = s.sWeight > 0
    ? ` stroke="${sFill}" stroke-width="${s.sWeight}" stroke-linejoin="round"`
    : '';

  let rectEl = '';
  if (s.shape === 'circle') {
    rectEl = `<circle cx="35.5" cy="31" r="31" fill="${containerFill}"/>`;
  } else if (s.shape === 'outline') {
    rectEl = `<rect y="4" width="71" height="55" rx="8" fill="none" stroke="${containerFill}" stroke-width="2"/>`;
  } else if (s.shape !== 'none') {
    rectEl = `<rect y="4" width="71" height="55" rx="8" fill="${containerFill}"/>`;
  }

  return `<g transform="translate(0,${ty.toFixed(2)}) scale(${s.scale})">${rectEl}<g${intT}><path d="${S_PATH}" fill="${sFill}"${swAttr}/><path d="${B_PATH}" fill="${sFill}"${swAttr}/></g></g>`;
}

function wmBlock(s, syncFill, valFill, x, y) {
  const syncText = s.accent === 'bracket' ? '[SYNC]' : 'SYNC';
  const lh = s.letterHeight || 1;
  const scaleAttr = lh !== 1 ? ` transform="translate(0,${y}) scale(1,${lh}) translate(0,-${y})"` : '';
  return `<g${scaleAttr}><text x="${x}" y="${y}" font-family="'DM Sans', sans-serif" font-size="32" letter-spacing="${s.spacing}"><tspan font-weight="${s.weight}" fill="${syncFill}">${syncText}</tspan><tspan font-weight="400" fill="${valFill}"> VALUATIONS</tspan></text></g>`;
}

function buildAllVariants(s) {
  const markW   = s.shape === 'none' ? 63 : Math.round(71 * s.scale + 12);
  const wmY_val = 44 + s.wmY;
  const colorSyncFill = s.accent === 'gold' ? '#B5A878' : '#243D52';

  const FULL = (mark, wm) =>
    `<svg width="450" height="62" viewBox="0 0 450 62" fill="none" xmlns="http://www.w3.org/2000/svg">${mark}${wm}</svg>`;
  const MARK = (m) =>
    `<svg width="71" height="63" viewBox="0 0 71 63" fill="none" xmlns="http://www.w3.org/2000/svg">${m}</svg>`;
  const WM = (t) =>
    `<svg width="370" height="40" viewBox="0 0 370 40" fill="none" xmlns="http://www.w3.org/2000/svg">${t}</svg>`;

  const syncText  = s.accent === 'bracket' ? '[SYNC]' : 'SYNC';
  const lh = s.letterHeight || 1;
  const wmScaleOpen  = lh !== 1 ? `<g transform="translate(0,32) scale(1,${lh}) translate(0,-32)">` : '';
  const wmScaleClose = lh !== 1 ? `</g>` : '';
  const wmTextDark  = `${wmScaleOpen}<text x="0" y="32" font-family="'DM Sans', sans-serif" font-size="32" letter-spacing="${s.spacing}"><tspan font-weight="${s.weight}" fill="${colorSyncFill}">${syncText}</tspan><tspan font-weight="400" fill="#243D52"> VALUATIONS</tspan></text>${wmScaleClose}`;
  const wmTextWhite = `${wmScaleOpen}<text x="0" y="32" font-family="'DM Sans', sans-serif" font-size="32" letter-spacing="${s.spacing}"><tspan font-weight="${s.weight}" fill="white">${syncText}</tspan><tspan font-weight="400" fill="white"> VALUATIONS</tspan></text>${wmScaleClose}`;

  return {
    logoColorFull: FULL(markBlock(s,'#1B2C3C','white'),  wmBlock(s, colorSyncFill, '#243D52', markW, wmY_val)),
    logoBlackFull: FULL(markBlock(s,'#0A0A0A','white'),  wmBlock(s, '#0A0A0A',    '#0A0A0A', markW, wmY_val)),
    logoWhiteFull: FULL(markBlock(s,'white','#1B2C3C'),  wmBlock(s, 'white',      'white',   markW, wmY_val)),
    markColor:     MARK(markBlock(s,'#1B2C3C','white')),
    markBlack:     MARK(markBlock(s,'#0A0A0A','white')),
    markWhite:     MARK(markBlock(s,'white','#1B2C3C')),
    wordmarkDark:  WM(wmTextDark),
    wordmarkWhite: WM(wmTextWhite),
  };
}

// ─────────────────────────────────────────────────────────────
// 3. HTML UPDATERS
// ─────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname);

function readFile(file) { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
function writeFile(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content, 'utf8');
  console.log(`  ✓ ${file}`);
}

/** index.html — replace inline nav SVG (text-based format) */
function updateIndexHTML(variants) {
  let html = readFile('index.html');

  // Replace everything between the <!-- Inline SVG logo --> comment and the closing </svg> before </a>
  const newSVG = variants.logoColorFull
    .replace('<svg ', '<svg width="auto" height="33" ');

  html = html.replace(
    /(<a href="#" class="nav-logo"[^>]*>)\s*<!--[^>]*-->\s*<svg[\s\S]*?<\/svg>(\s*<\/a>)/,
    `$1\n      <!-- Inline SVG logo — uses DM Sans (already loaded) for strakker wordmark -->\n      ${newSVG}\n    $2`
  );

  writeFile('index.html', html);
}

/** Sub-pages (brands, law-firms, faq, methodology, insurers, rights-holders, case-studies) */
function updateSubpageHTML(filename, variants) {
  let html = readFile(filename);

  // These pages have an outlined-path nav logo — replace the whole SVG with text-based
  const newSVG = `<svg class="logo-full" viewBox="0 0 450 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${
    variants.logoColorFull.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
  }</svg>`;

  html = html.replace(
    /(<a href="\/" class="nav-logo">)\s*<svg[\s\S]*?<\/svg>\s*(<\/a>)/,
    `$1\n    ${newSVG}\n  $2`
  );

  writeFile(filename, html);
}

/** floating-report.html — mark-only SVG in cover */
function updateFloatingReport(variants) {
  let html = readFile('floating-report.html');

  // Replace the mark SVG (viewBox 0 0 71 62 — same mark paths)
  const newMark = variants.markColor
    .replace('<svg ', '<svg ')
    .replace('viewBox="0 0 71 63"', 'viewBox="0 0 71 62"'); // preserve original viewBox

  html = html.replace(
    /<svg viewBox="0 0 71 62"[\s\S]*?<\/svg>/,
    newMark
  );

  writeFile('floating-report.html', html);
}

/** brand-guide.html — update static HTML SVGs (in Logos tab) + svgSources JS object */
function updateBrandGuide(variants) {
  let html = readFile('brand-guide.html');

  // ── Update svgSources entries ──────────────────────────────
  const keys = Object.keys(variants);
  for (const key of keys) {
    // Match: keyName: `<svg ...>...</svg>`  (backtick template literal)
    const escapedSVG = variants[key].replace(/`/g, '\\`');
    html = html.replace(
      new RegExp(`(${key}:\\s*\`)([^]*?)(\`)`),
      `$1${escapedSVG}$3`
    );
  }

  // ── Update static HTML SVGs (tagged with data-logo-key) ──
  // Pattern: <div ... data-logo-key="KEY">\n<svg...></svg>
  for (const key of keys) {
    html = html.replace(
      new RegExp(`(data-logo-key="${key}">)\\s*<svg[\\s\\S]*?<\\/svg>`),
      `$1${variants[key]}`
    );
  }

  writeFile('brand-guide.html', html);
}

// ─────────────────────────────────────────────────────────────
// 4. SVG FILE WRITERS
// ─────────────────────────────────────────────────────────────

function writeSVGFiles(variants) {
  const dir = path.join(ROOT, 'Logo Variants SV');
  const map = {
    'sv-logo-color.svg':    variants.logoColorFull,
    'sv-logo-black.svg':    variants.logoBlackFull,
    'sv-logo-white.svg':    variants.logoWhiteFull,
    'sv-mark-color.svg':    variants.markColor,
    'sv-mark-black.svg':    variants.markBlack,
    'sv-mark-white.svg':    variants.markWhite,
    'sv-wordmark-dark.svg': variants.wordmarkDark,
    'sv-wordmark-white.svg':variants.wordmarkWhite,
  };
  for (const [filename, svg] of Object.entries(map)) {
    fs.writeFileSync(path.join(dir, filename), svg, 'utf8');
    console.log(`  ✓ Logo Variants SV/${filename}`);
  }

  // Root SVG files
  fs.writeFileSync(path.join(ROOT, 'sv-full-logo.svg'), variants.logoColorFull, 'utf8');
  console.log('  ✓ sv-full-logo.svg');
  fs.writeFileSync(path.join(ROOT, 'sv-logo-mark.svg'), variants.markColor, 'utf8');
  console.log('  ✓ sv-logo-mark.svg');
}

// ─────────────────────────────────────────────────────────────
// 5. OG IMAGE REGENERATION
// ─────────────────────────────────────────────────────────────

async function regenerateOGImage(s) {
  const { Resvg } = require('@resvg/resvg-js');

  // Mark lives in a 71×63 coordinate space.
  // We place it with a group transform: translate(markX, markY) scale(markScale)
  // so inner coordinates stay in the original 71×63 space.
  const markScale = 2.3;
  const markW = 71 * markScale;           // ≈163px
  const markH = 63 * markScale;           // ≈145px
  const markX = 130;                       // left edge of mark in OG canvas
  const markY = (630 - markH) / 2 - 10;  // vertically centred, nudge up slightly

  // Interior S scale (centered on mark midpoint)
  const ix = 35.5, iy = 31.5;
  const intT = s.sScale !== 1
    ? ` transform="translate(${ix},${iy}) scale(${s.sScale}) translate(-${ix},-${iy})"`
    : '';
  const swAttr = s.sWeight > 0
    ? ` stroke="white" stroke-width="${s.sWeight}" stroke-linejoin="round"`
    : '';
  // Mark vertical centering (same formula as playground)
  const ty = 31.5 * (1 - s.scale);

  let rectEl = '';
  if (s.shape === 'circle') {
    rectEl = `<circle cx="35.5" cy="31" r="31" fill="#1B2C3C"/>`;
  } else if (s.shape === 'outline') {
    rectEl = `<rect y="4" width="71" height="55" rx="8" fill="none" stroke="#1B2C3C" stroke-width="2"/>`;
  } else if (s.shape !== 'none') {
    rectEl = `<rect y="4" width="71" height="55" rx="8" fill="#1B2C3C"/>`;
  }

  const syncText = s.accent === 'bracket' ? '[SYNC]' : 'SYNC';
  const syncFill = s.accent === 'gold' ? '#B5A878' : '#243D52';
  const fwHeavy  = parseInt(s.weight) >= 600 ? s.weight : '700';

  // Wordmark x starts right of the mark
  const wmX = markX + markW + 40;
  const wmY = markY + markH / 2 + 28; // vertically aligned to mark centre

  const ogSVG = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F0EDE4"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#B5A878" stroke-width="1"/>

  <!-- [S] Mark — inner coords 71×63, scaled up via group transform -->
  <g transform="translate(${markX.toFixed(0)}, ${markY.toFixed(0)}) scale(${markScale})">
    <g transform="translate(0,${ty.toFixed(2)}) scale(${s.scale})">
      ${rectEl}
      <g${intT}>
        <path d="${S_PATH}" fill="white"${swAttr}/>
        <path d="${B_PATH}" fill="white"${swAttr}/>
      </g>
    </g>
  </g>

  <!-- SYNC VALUATIONS wordmark -->
  <text x="${wmX.toFixed(0)}" y="${wmY.toFixed(0)}"
        font-family="Lato, DejaVu Sans, sans-serif"
        font-size="76"
        letter-spacing="${Number(s.spacing) * 2}">
    <tspan font-weight="${fwHeavy}" fill="${syncFill}">${syncText}</tspan>
    <tspan font-weight="300" fill="#243D52"> VALUATIONS</tspan>
  </text>

  <!-- Tagline -->
  <text x="600" y="${(markY + markH + 52).toFixed(0)}"
        font-family="Lato, DejaVu Sans, sans-serif"
        font-size="15" font-weight="400" letter-spacing="5"
        fill="#B5A878" text-anchor="middle">
    INDEPENDENT SYNC LICENSING VALUATION
  </text>

  <!-- Domain -->
  <text x="600" y="578"
        font-family="Liberation Mono, DejaVu Sans Mono, monospace"
        font-size="13" letter-spacing="3"
        fill="#8a7a55" text-anchor="middle">
    SYNCVALUATIONS.COM
  </text>
</svg>`;

  const resvg = new Resvg(ogSVG, {
    fitTo:  { mode: 'width', value: 1200 },
    font:   { loadSystemFonts: true, defaultFontFamily: 'Lato' },
  });
  const pngData   = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(path.join(ROOT, 'og-image.png'), pngBuffer);
  console.log(`  ✓ og-image.png (${(pngBuffer.length / 1024).toFixed(0)} KB)`);
}

// ─────────────────────────────────────────────────────────────
// 6. MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔄  Sync Valuations — Logo Propagation');
  console.log('   State:', JSON.stringify(S));
  console.log('');

  const variants = buildAllVariants(S);

  console.log('HTML files:');
  updateIndexHTML(variants);
  for (const page of ['brands.html','law-firms.html','faq.html','methodology.html','insurers.html','rights-holders.html','case-studies.html','sync-license-cost.html']) {
    const fullPath = path.join(ROOT, page);
    if (fs.existsSync(fullPath)) updateSubpageHTML(page, variants);
  }
  updateFloatingReport(variants);
  updateBrandGuide(variants);

  console.log('\nSVG files:');
  writeSVGFiles(variants);

  console.log('\nOG image:');
  await regenerateOGImage(S);

  // Save the applied state to logo-state.json for reference
  fs.writeFileSync(path.join(ROOT, 'logo-state.json'), JSON.stringify(S, null, 2), 'utf8');
  console.log('  ✓ logo-state.json (state saved for future runs)');

  console.log('\n✅  Done. Logo propagated across all surfaces.\n');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
