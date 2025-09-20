import '@testing-library/jest-dom';

// Provide a global fetch for tests (some components call fetch during render)
try {
	// Prefer a synchronous commonjs-compatible polyfill so fetch is available
	try {
		// cross-fetch supports CommonJS require
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const cf = require('cross-fetch');
		if (typeof (globalThis as any).fetch === 'undefined') {
			(globalThis as any).fetch = (input: any, init?: any) => {
				// node-fetch requires absolute URLs. In tests many components call
				// fetch with relative paths like `/api/...` — normalize to localhost.
				let url = typeof input === 'string' ? input : (input && input.url) || '';
				if (url && url.startsWith('/')) url = `http://localhost${url}`;
				if (typeof input === 'string') return cf(url, init);
				// when input is Request-like, adjust and pass through
				const req = { ...(input as any), url: url || input.url };
				return cf(req, init);
			};
		}
	} catch (e) {
		// fallback to dynamic node-fetch import for ESM installs
		(async () => {
			try {
				const nf = await import('node-fetch');
				if (typeof (globalThis as any).fetch === 'undefined') {
					(globalThis as any).fetch = nf.default || nf;
				}
			} catch (e) {
				// if import fails, ignore and let tests run (some CI environments provide fetch)
			}
		})();
	}
} catch (e) {
	// ignore if node-fetch isn't available in the test environment
}

// As a last-resort: if fetch still isn't defined, provide a safe no-network fallback
if (typeof (globalThis as any).fetch === 'undefined') {
	(globalThis as any).fetch = async (input: any, init?: any) => {
		const url = typeof input === 'string' ? input : input?.url;
		// For local API routes return an empty successful JSON response
		if (typeof url === 'string' && url.startsWith('/api')) {
			return {
				ok: true,
				status: 200,
				json: async () => ({}),
				text: async () => '{}'
			} as any;
		}
		// Generic fallback: resolve with an empty response
		return { ok: true, status: 200, json: async () => ({}), text: async () => '{}' } as any;
	};
}

// Mock next/image to a simple img component for tests
jest.mock('next/image', () => ({
	__esModule: true,
	default: ({ src, alt, width, height, ...props }: any) => {
		return (
			// eslint-disable-next-line jsx-a11y/alt-text
			require('react').createElement('img', { src, alt, width, height, ...props })
		);
	}
}));

// Mock next-auth's useSession to avoid requiring SessionProvider in unit tests
jest.mock('next-auth/react', () => ({
	__esModule: true,
	useSession: () => ({ data: null, status: 'unauthenticated' }),
	signIn: jest.fn(),
	signOut: jest.fn(),
}));

// Conditionally mock API handlers that may be imported by pages during render in tests
try {
	const possiblePaths = [
		'./src/server/api/admin/create-initial-admin',
		'./pages/api/admin/create-initial-admin',
		'src/server/api/admin/create-initial-admin',
		'pages/api/admin/create-initial-admin'
	];
	for (const p of possiblePaths) {
		try {
			const apiPath = require.resolve(p);
			jest.mock(apiPath, () => ({
				__esModule: true,
				handler: jest.fn((req: any, res: any) => ({ status: 200 }))
			}));
			break;
		} catch (e) {
			// try next
		}
	}
} catch (e) {
	// ignore if module can't be resolved in test environment
}

// Mock next/router so components using useRouter() don't error in tests
jest.mock('next/router', () => ({
	useRouter: () => ({
		push: jest.fn(() => Promise.resolve()),
		replace: jest.fn(() => Promise.resolve()),
		pathname: '/',
		query: {},
		asPath: '/',
		events: { on: jest.fn(), off: jest.fn() }
	})
}));

// Prevent importing next-auth server internals (openid-client / jose) during unit tests
try {
	const authModule = require.resolve('./pages/api/auth/[...nextauth]');
	jest.mock(authModule, () => ({
		__esModule: true,
		authOptions: {}
	}));
} catch (e) {
	// ignore
}

// Silence expected noisy fetch connection refused messages during tests
// but allow other important errors (like unhandled exceptions) to surface.
const realConsoleError = console.error;
console.error = (...args: any[]) => {
	try {
		const first = args[0];
		if (typeof first === 'string') {
			// exact match for node-fetch ECONNREFUSED noise
			if (first.includes('FetchError') && first.includes('ECONNREFUSED')) {
				return;
			}
		}
	} catch (e) {
		// fall through to real console.error
	}
	realConsoleError.apply(console, args as any);
};

jest.mock('next-auth/next', () => ({
	__esModule: true,
	getServerSession: jest.fn(() => null)
}));
