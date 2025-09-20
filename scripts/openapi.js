const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API_DIRECTORIES = [
  path.join(ROOT, 'pages', 'api'),
  path.join(ROOT, 'src', 'server', 'api'),
];
const METHOD_NAMES = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

const RESOURCE_LABELS = {
  admin: { en: 'Admin', ko: '관리' },
  auth: { en: 'Authentication', ko: '인증' },
  barcodes: { en: 'Barcodes', ko: '바코드' },
  'db-test': { en: 'Database Test', ko: '데이터베이스 테스트' },
  dev: { en: 'Development', ko: '개발' },
  docs: { en: 'Documentation', ko: '문서' },
  integrations: { en: 'Integrations', ko: '연동' },
  meta: { en: 'Metadata', ko: '메타데이터' },
  mock: { en: 'Mock', ko: '목업' },
  orders: { en: 'Orders', ko: '주문' },
  products: { en: 'Products', ko: '상품' },
  suppliers: { en: 'Suppliers', ko: '공급사' },
  vendors: { en: 'Vendors', ko: '공급처' },
};

const METHOD_COPY = {
  GET: { collection: { en: 'List', ko: '목록 조회' }, single: { en: 'Retrieve', ko: '상세 조회' } },
  POST: { en: 'Create', ko: '생성' },
  PUT: { en: 'Replace', ko: '전체 수정' },
  PATCH: { en: 'Update', ko: '부분 수정' },
  DELETE: { en: 'Delete', ko: '삭제' },
  OPTIONS: { en: 'Options', ko: '옵션' },
  HEAD: { en: 'Head', ko: '헤더 조회' },
};

function titleCase(value) {
  return value
    .split(/[-_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function getResourceInfo(route) {
  const parts = route.split('/').filter(Boolean);
  if (!parts.length) {
    return { resource: 'root', en: 'Root', ko: '루트', isMock: false };
  }
  const [first = ''] = parts;
  const isMock = first === 'mock';
  const resourceKey = isMock ? parts[1] ?? 'mock' : first;
  const base = RESOURCE_LABELS[resourceKey] ?? {
    en: titleCase(resourceKey || 'Resource'),
    ko: resourceKey || '리소스',
  };
  const en = isMock ? `Mock ${base.en}` : base.en;
  const ko = isMock ? `목업 ${base.ko}` : base.ko;
  return { resource: resourceKey, en, ko, isMock };
}

function getMethodCopy(method, route) {
  const base = METHOD_COPY[method];
  if (!base) {
    return { en: method.toUpperCase(), ko: method.toUpperCase() };
  }
  if (method === 'GET') {
    const isCollection = !route.includes('{');
    return isCollection ? base.collection : base.single;
  }
  return base;
}

function valueToSet(value) {
  if (!value) return null;
  if (value instanceof Set) return new Set(value);
  if (Array.isArray(value)) return new Set(value);
  if (typeof value === 'string') {
    return new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }
  return null;
}

function shouldIncludeRoute(tag, resourceInfo, options) {
  if (!options) return true;
  if (options.mockOnly && !resourceInfo.isMock) return false;
  const includeTags = options.includeTags;
  const excludeTags = options.excludeTags;
  if (includeTags && includeTags.size && !includeTags.has(tag)) return false;
  if (excludeTags && excludeTags.size && excludeTags.has(tag)) return false;
  return true;
}

function getTagDescription(tag) {
  const base = RESOURCE_LABELS[tag];
  if (base) {
    return `${base.en} / ${base.ko}`;
  }
  const label = titleCase(tag || 'root');
  return `${label} / ${label}`;
}

function parseCliOptions(argv) {
  const options = {
    mockOnly: false,
    includeTags: null,
    excludeTags: new Set(),
    outputPath: null,
    help: false,
  };
  const positional = [];

  const addValues = (key, raw) => {
    if (!raw) return;
    const values = String(raw)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (!values.length) return;
    if (!options[key] || !(options[key] instanceof Set)) {
      options[key] = new Set();
    }
    values.forEach((value) => options[key].add(value));
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--mock-only') {
      options.mockOnly = true;
      continue;
    }
    if (arg === '--include-tags' || arg === '--include-tag') {
      addValues('includeTags', argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith('--include-tags=')) {
      addValues('includeTags', arg.slice('--include-tags='.length));
      continue;
    }
    if (arg === '--exclude-tags' || arg === '--exclude-tag') {
      addValues('excludeTags', argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith('--exclude-tags=')) {
      addValues('excludeTags', arg.slice('--exclude-tags='.length));
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    positional.push(arg);
  }

  if (options.includeTags instanceof Set && options.includeTags.size === 0) {
    options.includeTags = null;
  }

  options.outputPath = positional[0] ?? null;
  return options;
}

function listRouteFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const stack = [dir];
  const files = [];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('_')) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!/\.[tj]sx?$/.test(entry.name)) continue;
      if (/\.d\.ts$/.test(entry.name)) continue;
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeSegment(segment) {
  if (segment === 'index') return '';
  if (segment.startsWith('[[...') && segment.endsWith(']]')) {
    return `{${segment.slice(5, -2)}}`;
  }
  if (segment.startsWith('[...') && segment.endsWith(']')) {
    return `{${segment.slice(4, -1)}}`;
  }
  if (segment.startsWith('[') && segment.endsWith(']')) {
    return `{${segment.slice(1, -1)}}`;
  }
  return segment;
}

function toRoute(filePath, baseDir) {
  const relative = path.relative(baseDir, filePath);
  if (relative.startsWith('..')) return null;
  const noExt = relative.replace(/\.[tj]sx?$/, '');
  const segments = noExt.split(path.sep).map(normalizeSegment).filter(Boolean);
  const route = '/' + segments.join('/');
  return route === '/' ? route : route.replace(/\\/g, '/');
}

function detectMethods(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const methods = new Set();
  const regex = /['"`](GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    methods.add(match[1]);
  }
  if (!methods.size) {
    methods.add('GET');
  }
  return Array.from(methods);
}

function inferTag(route) {
  const parts = route.split('/').filter(Boolean);
  if (!parts.length) return 'root';
  return parts[0].replace(/[{}]/g, '') || 'root';
}

function pathParameters(route) {
  return route
    .split('/')
    .filter((segment) => segment.startsWith('{') && segment.endsWith('}'))
    .map((segment) => segment.slice(1, -1));
}

function buildResponse(method) {
  switch (method) {
    case 'POST':
      return { '201': { description: 'Created' } };
    case 'DELETE':
      return { '204': { description: 'No Content' } };
    default:
      return { '200': { description: 'OK' } };
  }
}

function buildRequestBody(method) {
  if (!['POST', 'PUT', 'PATCH'].includes(method)) return undefined;
  return {
    required: method === 'POST',
    content: {
      'application/json': {
        schema: { type: 'object', additionalProperties: true },
      },
    },
  };
}

function gatherRoutes() {
  const map = new Map();
  for (const baseDir of API_DIRECTORIES) {
    for (const filePath of listRouteFiles(baseDir)) {
      const route = toRoute(filePath, baseDir);
      if (!route) continue;
      const methods = detectMethods(filePath);
      const relativeSource = path.relative(ROOT, filePath);
      if (!map.has(route)) {
        map.set(route, {
          sources: new Set(),
          methods: new Map(),
        });
      }
      const entry = map.get(route);
      entry.sources.add(relativeSource);
      for (const method of methods) {
        if (!METHOD_NAMES.includes(method)) continue;
        if (!entry.methods.has(method)) {
          entry.methods.set(method, new Set());
        }
        entry.methods.get(method).add(relativeSource);
      }
    }
  }
  return map;
}

function buildSpec(rawOptions = {}) {
  const includeTags = valueToSet(rawOptions.includeTags);
  const excludeTags = valueToSet(rawOptions.excludeTags) || new Set();
  const options = {
    mockOnly: Boolean(rawOptions.mockOnly),
    includeTags,
    excludeTags,
  };

  const routeMap = gatherRoutes();
  const paths = {};
  const usedTags = new Set();

  const sortedRoutes = Array.from(routeMap.keys()).sort((a, b) => a.localeCompare(b));

  for (const route of sortedRoutes) {
    const entry = routeMap.get(route);
    if (!entry) continue;
    const tag = inferTag(route);
    const params = pathParameters(route);
    const resourceInfo = getResourceInfo(route);
    if (!shouldIncludeRoute(tag, resourceInfo, options)) continue;
    usedTags.add(tag);
    const operations = {};
    const methodNames = Array.from(entry.methods.keys()).sort((a, b) => a.localeCompare(b));

    for (const method of methodNames) {
      const lower = method.toLowerCase();
      const sources = Array.from(entry.methods.get(method) ?? []);
      const methodCopy = getMethodCopy(method, route);
      const englishSummary = `${methodCopy.en} ${resourceInfo.en}`;
      const koreanSummary = `${resourceInfo.ko} ${methodCopy.ko}`;
      const summary = `${englishSummary} / ${koreanSummary}`;
      const descriptionParts = [
        `English: ${methodCopy.en} ${resourceInfo.en} via ${method} ${route}.`,
        `한국어: ${method} ${route} 엔드포인트로 ${resourceInfo.ko}를 ${methodCopy.ko}.`,
      ];
      if (resourceInfo.isMock) {
        descriptionParts.push(
          'English: Returns mock data for demos and testing.',
          '한국어: 데모 및 테스트용 목업 데이터를 제공합니다.',
        );
      }
      descriptionParts.push(`Sources / 소스: ${sources.join(', ')}`);
      const description = descriptionParts.join('\n\n');

      const operation = {
        summary,
        description,
        tags: [tag],
        responses: buildResponse(method),
        'x-source-files': sources,
        'x-i18n': {
          en: {
            summary: englishSummary,
            description: `${methodCopy.en} ${resourceInfo.en} via ${method} ${route}.`,
          },
          ko: {
            summary: koreanSummary,
            description: `${method} ${route} 엔드포인트로 ${resourceInfo.ko}를 ${methodCopy.ko}.`,
          },
        },
      };
      const requestBody = buildRequestBody(method);
      if (requestBody) {
        operation.requestBody = requestBody;
      }
      if (params.length) {
        operation.parameters = params.map((name) => ({
          name,
          in: 'path',
          required: true,
          schema: { type: 'string' },
        }));
      }
      operations[lower] = operation;
    }

    const pathItem = operations;
    pathItem['x-source-files'] = Array.from(entry.sources);
    paths[route] = pathItem;
  }

  const infoDescriptionParts = [
    'English: Auto-generated OpenAPI spec from Next.js routes. Includes mock API endpoints and mock data for design & QA.',
    '한국어: Next.js 라우트에서 자동 생성된 OpenAPI 문서입니다. 디자인 및 QA를 위한 목업 API와 목업 데이터가 포함됩니다.',
    'Refresh / 갱신: `node scripts/openapi.js public/api/openapi.json`',
  ];

  if (options.mockOnly) {
    infoDescriptionParts.push(
      'English: Filter applied — showing mock endpoints only.',
      '한국어: 필터 적용 — 목업 엔드포인트만 표시됩니다.',
    );
  }
  if (includeTags && includeTags.size) {
    const list = Array.from(includeTags).sort().join(', ');
    infoDescriptionParts.push(
      `English: Included tags — ${list}.`,
      `한국어: 포함된 태그 — ${list}.`,
    );
  }
  if (excludeTags.size) {
    const list = Array.from(excludeTags).sort().join(', ');
    infoDescriptionParts.push(
      `English: Excluded tags — ${list}.`,
      `한국어: 제외된 태그 — ${list}.`,
    );
  }

  const infoDescription = infoDescriptionParts.join('\n\n');

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'FULGO API (Auto-generated) / FULGO API (자동 생성)',
      version: '0.1.0',
      description: infoDescription,
    },
    servers: [
      {
        url: '/api',
        description: 'Next.js API routes / Next.js API 라우트',
      },
    ],
    tags: Array.from(usedTags)
      .sort()
      .map((name) => ({ name, description: getTagDescription(name) })),
    paths,
    'x-generated-at': new Date().toISOString(),
    'x-languages': ['en', 'ko'],
  };

  const generatorOptions = {
    mockOnly: options.mockOnly ? true : undefined,
    includeTags: includeTags && includeTags.size ? Array.from(includeTags).sort() : undefined,
    excludeTags: excludeTags.size ? Array.from(excludeTags).sort() : undefined,
  };

  Object.keys(generatorOptions).forEach((key) => {
    const value = generatorOptions[key];
    if (Array.isArray(value) && value.length === 0) {
      delete generatorOptions[key];
      return;
    }
    if (value === undefined) {
      delete generatorOptions[key];
    }
  });

  if (Object.keys(generatorOptions).length) {
    spec['x-generator-options'] = generatorOptions;
  }

  return spec;
}

const defaultSpec = buildSpec();

module.exports = defaultSpec;
module.exports.buildSpec = buildSpec;

if (require.main === module) {
  const cliOptions = parseCliOptions(process.argv.slice(2));
  if (cliOptions.help) {
    console.log('Usage: node scripts/openapi.js [options] [output.json]');
    console.log('Options:');
    console.log('  --mock-only              Only include routes that serve mock data (prefixed with /mock).');
    console.log('  --include-tags=a,b       Include only routes whose top-level tag matches the comma separated list.');
    console.log('  --exclude-tags=a,b       Exclude routes whose top-level tag matches the comma separated list.');
    console.log('  -h, --help               Show this message.');
    process.exit(0);
  }
  const spec = buildSpec(cliOptions);
  const json = JSON.stringify(spec, null, 2);
  if (cliOptions.outputPath) {
    fs.writeFileSync(path.resolve(process.cwd(), cliOptions.outputPath), json);
    console.log(`OpenAPI spec written to ${cliOptions.outputPath}`);
  } else {
    process.stdout.write(json);
  }
}
