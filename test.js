// save as xml2csv.js
// 사용법: node xml2csv.js ./메이크샵_상품.xml ./makeshop_products.csv
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import iconv from 'iconv-lite';
import { stringify } from 'csv-stringify/sync';
import path from 'path';

const [,, inPath, outPath = './makeshop_products.csv'] = process.argv;
if (!inPath) {
  console.error('Usage: node xml2csv.js <input.xml> [output.csv]');
  process.exit(1);
}

// 1) XML 읽기 (바이너리 → 헤더 인식 실패 대비 EUC-KR/CP949 후보 디코딩)
const raw = fs.readFileSync(inPath);
let text = raw.toString(); // 기본 UTF-8 시도
if (!text.includes('<?xml') || /encoding="(euc-kr|cp949)"/i.test(text)) {
  // 헤더가 EUC-KR/CP949로 명시되었거나 UTF-8 파싱 실패하면 재디코딩
  try { text = iconv.decode(raw, 'euc-kr'); } catch {}
}

// 2) XML → JS 객체
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  trimValues: true,
});
const obj = parser.parse(text);

// 3) 레코드 후보 탐색 (최다 반복 태그를 레코드로 간주)
function findRecordArray(node) {
  if (Array.isArray(node)) return node;
  if (node && typeof node === 'object') {
    let best = null;
    for (const [k, v] of Object.entries(node)) {
      if (Array.isArray(v) && (best === null || v.length > best.length)) best = v;
      const deeper = findRecordArray(v);
      if (Array.isArray(deeper) && (best === null || deeper.length > best.length)) best = deeper;
    }
    return best;
  }
  return null;
}
const records = findRecordArray(obj) || [obj];

// 4) 평탄화
function flatten(entry, prefix = '', out = {}) {
  if (entry === null || entry === undefined) return out;
  if (typeof entry !== 'object') {
    out[prefix] = String(entry);
    return out;
  }
  if (Array.isArray(entry)) {
    // 단순 값 배열이면 |로 합치고, 객체 배열이면 인덱스 붙임
    const allScalar = entry.every(v => v === null || typeof v !== 'object');
    if (allScalar) {
      out[prefix] = entry.map(v => (v ?? '')).join('|');
    } else {
      entry.forEach((v, i) => flatten(v, `${prefix}[${i+1}]`, out));
    }
    return out;
  }
  for (const [k, v] of Object.entries(entry)) {
    const key = prefix ? `${prefix}.${k}` : k;
    flatten(v, key, out);
  }
  return out;
}

const flatRows = records.map(r => flatten(r));
const headers = Array.from(flatRows.reduce((set, row) => {
  Object.keys(row).forEach(k => set.add(k));
  return set;
}, new Set())).sort();

// 5) CSV 만들기 (엑셀 호환을 위해 BOM 추가)
const csv = stringify(flatRows.map(r => headers.map(h => {
  const val = r[h] ?? '';
  return String(val).replace(/\r?\n|\t/g, ' ');
})), { header: true, columns: headers });

const BOM = Buffer.from([0xEF, 0xBB, 0xBF]);
fs.writeFileSync(outPath, Buffer.concat([BOM, Buffer.from(csv, 'utf8')]));

console.log(`✅ Wrote CSV: ${path.resolve(outPath)} (UTF-8 BOM)`);