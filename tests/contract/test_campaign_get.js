/**
 * Contract test for campaign data service
 * This test verifies the service contract for individual campaign data
 */

describe('Campaign Data Service Contract', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // Set environment variables
    process.env.BROADSTREET_API_TOKEN = 'test-token';
    process.env.BROADSTREET_API_BASE_URL = 'https://api.broadstreetads.com/v1';
  });

  it('should return campaign data with correct structure for valid ID', async () => {
    // Mock axios
    const mockAxios = {
      create: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          data: {
            impressions: 1000,
            clicks: 50,
            ctr: 0.05,
            spend: 25.50
          }
        })
      }))
    };

    jest.doMock('axios', () => mockAxios);

    const CampaignService = require('../../src/services/campaignService').default;
    const data = await CampaignService.getCampaignData(123);

    expect(data).toHaveProperty('campaignId');
    expect(data).toHaveProperty('impressions');
    expect(data).toHaveProperty('clicks');
    expect(data).toHaveProperty('ctr');
    expect(data).toHaveProperty('spend');

    expect(typeof data.campaignId).toBe('number');
    expect(typeof data.impressions).toBe('number');
    expect(typeof data.clicks).toBe('number');
    expect(typeof data.ctr).toBe('number');
    expect(typeof data.spend).toBe('number');
  });

  it('should handle 404 for non-existent campaign ID', async () => {
    // Mock axios to return 404
    const mockAxios = {
      create: jest.fn(() => ({
        get: jest.fn().mockRejectedValue({
          response: { status: 404 }
        })
      })),
      isAxiosError: jest.fn(() => true)
    };

    jest.doMock('axios', () => mockAxios);

    const CampaignService = require('../../src/services/campaignService').default;

    await expect(CampaignService.getCampaignData(999999)).rejects.toThrow('Campaign with ID 999999 not found');
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

    await expect(CampaignService.getCampaignData(123)).rejects.toThrow('Failed to fetch campaign data for ID 123');
  });
});
