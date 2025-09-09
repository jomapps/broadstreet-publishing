/**
 * Contract test for campaign service
 * This test verifies the service contract and API structure
 */

describe('Campaign Service Contract', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // Set environment variables
    process.env.BROADSTREET_API_TOKEN = 'test-token';
    process.env.BROADSTREET_API_BASE_URL = 'https://api.broadstreetads.com/v1';
  });

  it('should return array of campaigns with correct structure', async () => {
    // Mock axios
    const mockAxios = {
      create: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          data: [
            { id: 1, name: 'Test Campaign 1', status: 'active' },
            { id: 2, name: 'Test Campaign 2', status: 'paused' }
          ]
        })
      }))
    };

    jest.doMock('axios', () => mockAxios);

    const CampaignService = require('../../src/services/campaignService').default;
    const campaigns = await CampaignService.getAllCampaigns();

    expect(Array.isArray(campaigns)).toBe(true);

    if (campaigns.length > 0) {
      const campaign = campaigns[0];
      expect(campaign).toHaveProperty('id');
      expect(campaign).toHaveProperty('name');
      expect(campaign).toHaveProperty('status');
      expect(typeof campaign.id).toBe('number');
      expect(typeof campaign.name).toBe('string');
      expect(typeof campaign.status).toBe('string');
    }
  });

  it('should handle API errors gracefully', async () => {
    // Mock axios to throw error
    const mockAxios = {
      create: jest.fn(() => ({
        get: jest.fn().mockRejectedValue(new Error('API Error'))
      })),
      isAxiosError: jest.fn(() => false)
    };

    jest.doMock('axios', () => mockAxios);

    const CampaignService = require('../../src/services/campaignService').default;

    await expect(CampaignService.getAllCampaigns()).rejects.toThrow('Failed to fetch campaigns from Broadstreet API');
  });
});
