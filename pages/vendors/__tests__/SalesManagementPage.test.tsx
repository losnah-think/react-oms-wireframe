import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SalesManagementPage from '../SalesManagementPage';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock design system components
jest.mock('../../../design-system', () => ({
  Container: ({ children, ...props }: any) => <div data-testid="container" {...props}>{children}</div>,
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Input: ({ value, onChange, ...props }: any) => (
    <input value={value} onChange={onChange} {...props} />
  ),
  Modal: ({ children, open, onClose, title, ...props }: any) => (
    open ? (
      <div data-testid="modal" {...props}>
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
  Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
}));

describe('SalesManagementPage', () => {
  const mockVendors = [
    {
      id: '1',
      name: 'Test Vendor A',
      code: 'TVA',
      platform: 'cafe24' as const,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      settings: { manager: 'John Doe' },
    },
    {
      id: '2',
      name: 'Test Vendor B',
      code: 'TVB',
      platform: 'coupang' as const,
      is_active: false,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      settings: { manager: 'Jane Doe' },
    },
  ];

  const mockApiResponse = {
    vendors: mockVendors,
    meta: { total: 2, limit: 10, offset: 0 },
  };

  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    } as any);
  });

  it('renders the page title and header', () => {
    render(<SalesManagementPage />);

    expect(screen.getByText('판매처 관리')).toBeInTheDocument();
    expect(screen.getByText('판매처를 조회하고 연결 상태를 관리합니다.')).toBeInTheDocument();
    expect(screen.getByText('새로운 판매처 등록')).toBeInTheDocument();
  });

  it('renders search and filter controls', () => {
    render(<SalesManagementPage />);

    expect(screen.getByPlaceholderText('판매처 이름, 코드 검색')).toBeInTheDocument();
    expect(screen.getByDisplayValue('전체')).toBeInTheDocument(); // Platform filter
    expect(screen.getByDisplayValue('전체')).toBeInTheDocument(); // Status filter
  });

  it('fetches and displays vendors on mount', async () => {
    render(<SalesManagementPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/vendors?limit=10&offset=0&q=&is_active=all&platform=all');
    });

    await waitFor(() => {
      expect(screen.getByText('Test Vendor A')).toBeInTheDocument();
      expect(screen.getByText('Test Vendor B')).toBeInTheDocument();
    });
  });

  it('displays vendor data in table format', async () => {
    render(<SalesManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Vendor A')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText('코드')).toBeInTheDocument();
    expect(screen.getByText('플랫폼')).toBeInTheDocument();
    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByText('등록일')).toBeInTheDocument();

    // Check vendor data
    expect(screen.getByText('TVA')).toBeInTheDocument();
    expect(screen.getByText('cafe24')).toBeInTheDocument();
    expect(screen.getByText('활성')).toBeInTheDocument();
  });

  it('filters vendors by search query', async () => {
    render(<SalesManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Vendor A')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('판매처 이름, 코드 검색');
    fireEvent.change(searchInput, { target: { value: 'Test Vendor A' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/vendors')
      );
    });
  });

  it('filters vendors by platform', async () => {
    render(<SalesManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Vendor A')).toBeInTheDocument();
    });

    const platformSelect = screen.getAllByDisplayValue('전체')[0];
    fireEvent.change(platformSelect, { target: { value: 'cafe24' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('platform=cafe24')
      );
    });
  });

  it('opens create modal when clicking register button', async () => {
    render(<SalesManagementPage />);

    const registerButton = screen.getByText('새로운 판매처 등록');
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('판매처 생성')).toBeInTheDocument();
    });
  });

  it('opens view modal when clicking view button', async () => {
    // Mock the individual vendor fetch
    mockFetch.mockImplementation((url: any) => {
      if (typeof url === 'string' && url.includes('/api/vendors/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ vendor: mockVendors[0] }),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      } as any);
    });

    render(<SalesManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Vendor A')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('보기');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('판매처 상세')).toBeInTheDocument();
      expect(screen.getAllByText('Test Vendor A')[1]).toBeInTheDocument(); // Second occurrence in modal
    });
  });

  it('handles loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<SalesManagementPage />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<SalesManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays empty state when no vendors found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ vendors: [], meta: { total: 0, limit: 10, offset: 0 } }),
    } as any);

    render(<SalesManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('조건에 맞는 판매처가 없습니다.')).toBeInTheDocument();
    });
  });
});