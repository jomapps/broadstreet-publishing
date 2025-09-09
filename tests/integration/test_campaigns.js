/**
 * Integration test for campaign functionality
 * Tests the full flow from API call to Broadstreet API integration
 */

describe('Campaign Integration Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // Set environment variables
    process.env.BROADSTREET_API_TOKEN = 'test-token';
    process.env.BROADSTREET_API_BASE_URL = 'https://api.broadstreetads.com/v1';
  });

  describe('Fetching campaigns from Broadstreet API', () => {
    it('should fetch campaigns successfully', async () => {
      // Mock successful Broadstreet API response
      const mockCampaigns = [
        { id: 1, name: 'Test Campaign 1', status: 'active' },
        { id: 2, name: 'Test Campaign 2', status: 'paused' }
      ];

      // Mock axios
      const mockAxios = {
        create: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            data: mockCampaigns,
            status: 200
          })
        })),
        isAxiosError: jest.fn(() => false)
      };

      jest.doMock('axios', () => mockAxios);

      const CampaignService = require('../../src/services/campaignService').default;
      const campaigns = await CampaignService.getAllCampaigns();

      expect(campaigns).toEqual(mockCampaigns);
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

  describe('Fetching campaign data from Broadstreet API', () => {
    it('should fetch campaign data successfully', async () => {
      const mockApiResponse = {
        impressions: 1000,
        clicks: 50,
        ctr: 0.05,
        spend: 25.50
      };

      const expectedCampaignData = {
        campaignId: 123,
        impressions: 1000,
        clicks: 50,
        ctr: 0.05,
        spend: 25.50
      };

      // Mock axios
      const mockAxios = {
        create: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            data: mockApiResponse,
            status: 200
          })
        })),
        isAxiosError: jest.fn(() => false)
      };

      jest.doMock('axios', () => mockAxios);

      const CampaignService = require('../../src/services/campaignService').default;
      const campaignData = await CampaignService.getCampaignData(123);

      expect(campaignData).toEqual(expectedCampaignData);
    });

    it('should handle 404 for non-existent campaigns', async () => {
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
  });
});
