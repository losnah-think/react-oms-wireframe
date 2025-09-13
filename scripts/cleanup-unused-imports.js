#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

function findFiles() {
  return glob.sync('src/**/*.{ts,tsx,js,jsx}', { nodir: true });
}

function read(file) { return fs.readFileSync(file, 'utf8'); }

function write(file, content) { fs.writeFileSync(file, content, 'utf8'); }

function parseImports(content) {
  const importRegex = /(^|\n)\s*import\s+([^;]+?)\s+from\s+['"]([^'"]+)['"];?/g;
  const matches = [];
  let m;
  while ((m = importRegex.exec(content)) !== null) {
    const full = m[0];
    const spec = m[2].trim();
    const source = m[3];
    const start = m.index + (m[1] ? m[1].length : 0);
    matches.push({ full, spec, source, start });
  }
  return matches;
}

function extractNamed(spec) {
  // handle default + named: React, { useState, useEffect }
  const named = [];
  const defaultAndNamed = spec.split(',').map(s => s.trim()).filter(Boolean);
  for (const part of defaultAndNamed) {
    if (part.startsWith('{') && part.endsWith('}')) {
      const inner = part.slice(1, -1);
      inner.split(',').map(s => s.trim()).forEach(n => { if (n) named.push(n); });
    } else if (part.startsWith('{')) {
      // multiline case
      const inner = part.replace(/^{/, '').replace(/}$/, '');
      inner.split(',').map(s => s.trim()).forEach(n => { if (n) named.push(n); });
    } else if (part.includes('{')) {
      const after = part.slice(part.indexOf('{'));
      const inner = after.replace(/^{/, '').replace(/}$/, '');
      inner.split(',').map(s => s.trim()).forEach(n => { if (n) named.push(n); });
    }
  }
  return named;
}

function removeUnusedImports() {
  const files = findFiles();
  const edits = [];
  for (const file of files) {
    let content = read(file);
    const originals = content;
    const imports = parseImports(content);
    let fileChanged = false;
    for (const im of imports) {
      // Only consider named imports (with braces) or mixed imports
      if (!/\{/.test(im.spec)) continue;
      // skip type-only imports (TS) starting with 'type '
      const spec = im.spec.replace(/^type\s+/, '');
      const named = extractNamed(im.spec);
      if (named.length === 0) continue;
      const lines = content.split('\n');
      const importLineIndex = content.slice(0, im.start).split('\n').length - 1;
      const importLine = lines[importLineIndex];

      const unused = [];
      for (const name of named) {
        const nameOnly = name.split(' as ')[0].trim();
        const re = new RegExp('\\b' + nameOnly + '\\b', 'g');
        // count matches excluding import line
        const count = (content.replace(importLine, '') || '').match(re);
        if (!count) unused.push(name);
      }
      if (unused.length === 0) continue;

      // prepare new import spec by removing unused
      let newSpec = im.spec;
      for (const u of unused) {
        // remove occurrences of the unused name inside braces
        const pattern = new RegExp('\\b' + u.replace(/[-\\/\^$*+?.()|[\]{}]/g, '\\$&') + '\\b,?\\s*', 'g');
        newSpec = newSpec.replace(pattern, '');
      }
      // cleanup leftover commas and spaces
      newSpec = newSpec.replace(/\{\s*,/g, '{').replace(/,\s*\}/g, '}').replace(/,\s*,/g, ',');

      if (/\{\s*\}/.test(newSpec)) {
        // no named imports left; remove entire import line
        // remove full import occurrence
        content = content.replace(im.full, '');
        fileChanged = true;
      } else {
        // replace only the spec part
        const oldFull = im.full;
        const newFull = im.full.replace(im.spec, newSpec);
        content = content.replace(oldFull, newFull);
        fileChanged = true;
      }
    }
    if (fileChanged && content !== originals) {
      edits.push({ file, content });
    }
  }

  return edits;
}

function main() {
  const edits = removeUnusedImports();
  if (edits.length === 0) {
    console.log('No unused named imports found.');
    return;
  }
  console.log('Found edits for', edits.length, 'files');
  edits.forEach(e => {
    console.log('-', e.file);
  });

  // apply edits
  for (const e of edits) {
    write(e.file, e.content);
  }
  console.log('Applied edits. Please run tests/linters to verify.');
}

main();
