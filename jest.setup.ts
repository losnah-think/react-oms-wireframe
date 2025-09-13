import '@testing-library/jest-dom';

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
