// Rebuild app.bundle.js from the .jsx sources after any frontend change.
// Run:  npm i @babel/core @babel/preset-react && node scripts/build-frontend.js
const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const files = [
  'ui.jsx', 'tweaks-panel.jsx', 'store.jsx',
  'sections1.jsx', 'sections2.jsx', 'sections3.jsx',
  'views1.jsx', 'views2.jsx', 'views_cortex.jsx',
  'graph.jsx', 'views_ops.jsx', 'views_llmops.jsx',
];

let out = '';
for (const f of files) {
  const res = babel.transformSync(fs.readFileSync(path.join(ROOT, f), 'utf8'), {
    presets: [['@babel/preset-react']], filename: f, comments: false,
  });
  out += `\n/* ===== ${f} ===== */\n` + res.code + '\n';
}
fs.writeFileSync(path.join(ROOT, 'app.bundle.js'), out);
console.log('wrote app.bundle.js', (out.length / 1024).toFixed(1), 'KB from', files.length, 'files');
