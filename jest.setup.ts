import '@testing-library/jest-dom';

// Provide a global fetch for tests (some components call fetch during render)
try {
	// node-fetch v3 is ESM; use dynamic import so it works with CommonJS test runner
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
} catch (e) {
	// ignore if node-fetch isn't available in the test environment
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
		'./src/pages/api/admin/create-initial-admin',
		'./pages/api/admin/create-initial-admin',
		'src/pages/api/admin/create-initial-admin',
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
		push: jest.fn(),
		replace: jest.fn(),
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

jest.mock('next-auth/next', () => ({
	__esModule: true,
	getServerSession: jest.fn(() => null)
}));
