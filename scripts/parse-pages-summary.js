#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/parse-pages-summary.js [path-to-pages-summary.json]');
  process.exit(1);
}

const arg = process.argv[2] || path.join(process.cwd(), 'test-results', 'pages-summary.json');
if (!fs.existsSync(arg)) {
  console.error('File not found:', arg);
  usage();
}

try {
  const raw = fs.readFileSync(arg, 'utf-8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error('Unexpected file format: expected array');
    process.exit(2);
  }

  let pass = 0;
  let fail = 0;
  const failures = [];

  data.forEach(item => {
    if (item.status === 'pass') pass++;
    else if (item.status === 'fail') {
      fail++;
      failures.push({ page: item.page, message: item.message || '' });
    }
  });

  console.log('\nPages Summary:');
  console.log('Total:', data.length, 'Pass:', pass, 'Fail:', fail);
  if (fail > 0) {
    console.log('\nFailures:');
    failures.forEach((f, i) => {
      console.log(`${i + 1}. ${f.page}`);
      console.log('   ', f.message.split('\n').slice(0, 6).join('\n    '));
    });
  } else {
    console.log('\nAll pages passed rendering.');
  }
} catch (e) {
  console.error('Error parsing file:', e && e.message ? e.message : String(e));
  process.exit(3);
}
