import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CampaignList from '@/components/CampaignList';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

// Mock fetch
global.fetch = jest.fn();

const mockCampaigns = [
  {
    id: 1,
    name: 'Summer Sale Campaign',
    status: 'active',
    startDate: '2024-06-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Back to School Promotion',
    status: 'paused',
    startDate: '2024-08-15T00:00:00.000Z',
  },
];

describe('CampaignList Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('shows loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<CampaignList />);
    
    expect(screen.getByText('Loading campaigns...')).toBeInTheDocument();
  });

  it('displays campaigns after successful fetch', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCampaigns,
    });

    render(<CampaignList />);

    await waitFor(() => {
      expect(screen.getByText('Summer Sale Campaign')).toBeInTheDocument();
      expect(screen.getByText('Back to School Promotion')).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch campaigns' }),
    });

    render(<CampaignList />);

    await waitFor(() => {
      expect(screen.getByText('Error loading campaigns')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch campaigns')).toBeInTheDocument();
    });
  });

  it('shows empty state when no campaigns', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<CampaignList />);

    await waitFor(() => {
      expect(screen.getByText('No campaigns found')).toBeInTheDocument();
      expect(screen.getByText("You don't have any campaigns yet.")).toBeInTheDocument();
    });
  });

  it('displays campaign status with correct styling', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCampaigns,
    });

    render(<CampaignList />);

    await waitFor(() => {
      const activeStatus = screen.getByText('active');
      const pausedStatus = screen.getByText('paused');
      
      expect(activeStatus).toHaveClass('bg-green-100', 'text-green-800');
      expect(pausedStatus).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  it('calls refresh when refresh button is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockCampaigns,
    });

    render(<CampaignList />);

    await waitFor(() => {
      expect(screen.getByText('Summer Sale Campaign')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('calls onCampaignSelect when campaign is clicked', async () => {
    const mockOnCampaignSelect = jest.fn();
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCampaigns,
    });

    render(<CampaignList onCampaignSelect={mockOnCampaignSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Summer Sale Campaign')).toBeInTheDocument();
    });

    const campaignCard = screen.getByText('Summer Sale Campaign').closest('div');
    fireEvent.click(campaignCard!);

    expect(mockOnCampaignSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      name: 'Summer Sale Campaign',
      status: 'active',
    }));
  });
});
