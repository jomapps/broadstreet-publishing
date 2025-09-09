import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CampaignDetail from '@/components/CampaignDetail';

// Mock fetch
global.fetch = jest.fn();

const mockCampaignData = {
  campaignId: 1,
  impressions: 50000,
  clicks: 1250,
  ctr: 0.025,
  spend: 500.75,
};

describe('CampaignDetail Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('shows loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<CampaignDetail campaignId={1} />);
    
    expect(screen.getByText('Loading campaign data...')).toBeInTheDocument();
  });

  it('displays campaign data after successful fetch', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCampaignData,
    });

    render(<CampaignDetail campaignId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Campaign #1 Performance')).toBeInTheDocument();
      expect(screen.getAllByText('50,000')).toHaveLength(2); // Appears in stats and summary
      expect(screen.getAllByText('1,250')).toHaveLength(2); // Appears in stats and summary
      expect(screen.getAllByText('2.50%')).toHaveLength(2); // Appears in stats and summary
      expect(screen.getAllByText('$500.75')).toHaveLength(2); // Appears in stats and summary
    });
  });

  it('displays error message on fetch failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Campaign not found' }),
    });

    render(<CampaignDetail campaignId={999} />);

    await waitFor(() => {
      expect(screen.getByText('Error loading campaign data')).toBeInTheDocument();
      expect(screen.getByText('Campaign not found')).toBeInTheDocument();
    });
  });

  it('shows no data message when campaign data is null', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    render(<CampaignDetail campaignId={1} />);

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
      expect(screen.getByText('Campaign data could not be loaded.')).toBeInTheDocument();
    });
  });

  it('displays all stat cards with correct icons and values', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCampaignData,
    });

    render(<CampaignDetail campaignId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Impressions')).toBeInTheDocument();
      expect(screen.getByText('Clicks')).toBeInTheDocument();
      expect(screen.getByText('Click-Through Rate')).toBeInTheDocument();
      expect(screen.getByText('Total Spend')).toBeInTheDocument();
    });
  });

  it('displays campaign summary section', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCampaignData,
    });

    render(<CampaignDetail campaignId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Campaign Summary')).toBeInTheDocument();
      expect(screen.getByText('Campaign ID:')).toBeInTheDocument();
      expect(screen.getByText('Total Impressions:')).toBeInTheDocument();
      expect(screen.getByText('Total Clicks:')).toBeInTheDocument();
      expect(screen.getByText('Click-Through Rate:')).toBeInTheDocument();
      expect(screen.getByText('Total Spend:')).toBeInTheDocument();
    });
  });

  it('calls refresh when refresh button is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockCampaignData,
    });

    render(<CampaignDetail campaignId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Campaign #1 Performance')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh Data');
    fireEvent.click(refreshButton);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('fetches data when campaignId changes', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockCampaignData,
    });

    const { rerender } = render(<CampaignDetail campaignId={1} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/campaigns/1');
    });

    rerender(<CampaignDetail campaignId={2} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/campaigns/2');
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
