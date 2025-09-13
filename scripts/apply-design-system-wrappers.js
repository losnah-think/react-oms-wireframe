const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DESIGN_SYSTEM = path.join(SRC, 'design-system');

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function computeImportPath(filePath) {
  const fileDir = path.dirname(filePath);
  const rel = path.relative(fileDir, DESIGN_SYSTEM);
  let pos = toPosix(rel);
  if (!pos.startsWith('.')) pos = './' + pos;
  return pos;
}

function findMatchingParenIndex(str, startIdx) {
  // startIdx is index of the '(' char
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  // skip test files and existing containers
  if (/\.test\./.test(file)) return false;
  if (/from\s+['\"].*design-system/.test(content) || /<Container[\s>]/.test(content)) {
    return false;
  }

  // find first occurrence of "return (" or "return(" or "return <"
  const returnParenIdx = content.indexOf('return (');
  const returnParenIdxAlt = content.indexOf('return(');
  const returnTagIdx = content.indexOf('return <');
  let startIdx = -1;
  let openParenIdx = -1;
  if (returnParenIdx !== -1) {
    startIdx = returnParenIdx;
    openParenIdx = content.indexOf('(', startIdx);
  } else if (returnParenIdxAlt !== -1) {
    startIdx = returnParenIdxAlt;
    openParenIdx = content.indexOf('(', startIdx);
  } else if (returnTagIdx !== -1) {
    // handle `return <div>...` pattern by inserting container after return
    startIdx = returnTagIdx;
    openParenIdx = -1; // special
  } else {
    return false;
  }

  // compute import path
  const importPath = computeImportPath(file);
  const importStatement = `import { Container } from '${importPath}';`;

  // insert import near other imports (after the last import)
  const importRegex = /(^import[\s\S]*?from\s+['\"][^'\"]+['\"];?\s*)/m;
  let modified = content;
  const imports = modified.match(/(^import[\s\S]*?;\s*)/m);
  if (imports) {
    const lastImportEnd = modified.lastIndexOf(';', imports.index + imports[0].length);
  }

  // Simple: insert import after the last existing import statement
  const importMatches = [...modified.matchAll(/^import .*;\s*$/gm)];
  if (importMatches.length > 0) {
    const last = importMatches[importMatches.length - 1];
    const insertPos = last.index + last[0].length;
    modified = modified.slice(0, insertPos) + '\n' + importStatement + modified.slice(insertPos);
  } else {
    // no imports: add at top
    modified = importStatement + '\n' + modified;
  }

  // Now wrap return content with <Container>
  if (openParenIdx > 0) {
    const matchCloseIdx = findMatchingParenIndex(modified, openParenIdx);
    if (matchCloseIdx === -1) return false;
    // insert <Container ...> after the (
    const insertOpen = '<Container maxWidth="full">\n';
    modified = modified.slice(0, openParenIdx + 1) + insertOpen + modified.slice(openParenIdx + 1);
    // find where to insert closing </Container>
    // the previous matching index has shifted due to insertion; compute new close idx
    const newCloseIdx = matchCloseIdx + insertOpen.length;
    const insertClose = '\n</Container>';
    modified = modified.slice(0, newCloseIdx) + insertClose + modified.slice(newCloseIdx);
  } else {
    // return <... case: find index after 'return '
    const idx = modified.indexOf('return', startIdx);
    if (idx === -1) return false;
    const afterReturnIdx = idx + 'return'.length;
    // insert (<Container>
    modified = modified.slice(0, afterReturnIdx) + ' (<Container maxWidth="full">' + modified.slice(afterReturnIdx);
    // find the ending semicolon for that return; we'll heuristically find the next ');' or ';' after that position
    const closeIdx = modified.indexOf(');', afterReturnIdx);
    if (closeIdx !== -1) {
      modified = modified.slice(0, closeIdx) + '</Container>' + modified.slice(closeIdx);
    } else {
      // try to find last occurrence of '\n}\n' or end of file
      modified = modified + '\n</Container>';
    }
  }

  // backup original
  fs.writeFileSync(file + '.bak', content, 'utf8');
  fs.writeFileSync(file, modified, 'utf8');
  return true;
}

const files = glob.sync(path.join(SRC, 'pages', '**', '*.tsx'));
let changed = 0;
for (const f of files) {
  try {
    const ok = processFile(f);
    if (ok) {
      console.log('Updated:', f);
      changed++;
    }
  } catch (err) {
    console.error('Error processing', f, err.message);
  }
}
console.log(`Done. Files updated: ${changed}`);
