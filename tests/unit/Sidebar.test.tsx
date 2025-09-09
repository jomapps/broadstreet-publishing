import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, className }: any) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('Sidebar Component', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sidebar with title', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Broadstreet Dashboard')).toBeInTheDocument();
  });

  it('renders navigation menu items', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
  });

  it('highlights active menu item', () => {
    (usePathname as jest.Mock).mockReturnValue('/campaigns');
    render(<Sidebar />);
    
    const campaignsLink = screen.getByText('Campaigns').closest('a');
    expect(campaignsLink).toHaveClass('bg-blue-600');
  });

  it('shows correct links for menu items', () => {
    render(<Sidebar />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const campaignsLink = screen.getByText('Campaigns').closest('a');
    
    expect(dashboardLink).toHaveAttribute('href', '/');
    expect(campaignsLink).toHaveAttribute('href', '/campaigns');
  });

  it('displays footer text', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Powered by Broadstreet API')).toBeInTheDocument();
  });
});
