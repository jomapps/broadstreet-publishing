# Broadstreet Publishing Dashboard

A modern web application for managing and monitoring advertising campaigns through the Broadstreet API. Built with Next.js 14, TypeScript, and Tailwind CSS.

## ✅ Status: Fully Operational

The dashboard is now successfully integrated with the Broadstreet API and displaying real campaign data from your account.

## Features

- **✅ Live Campaign Data**: Successfully integrated with Broadstreet API displaying 28 real campaigns
- **✅ Campaign Management**: View and manage all your advertising campaigns with real-time status
- **✅ Network Support**: Supports multiple networks (FASH Medien Verlag GmbH - SCHWULISSIMO, Travel M)
- **✅ Advertiser Management**: 45 advertisers successfully retrieved and displayed
- **✅ Advertisement Tracking**: 101 advertisements properly fetched using network-based API approach
- **✅ Zone Management**: 620 zones (ad placements) configured and accessible
- **✅ Dashboard Statistics**: Real-time stats showing all components with accurate counts
- **✅ Responsive Design**: Works seamlessly on desktop and mobile devices
- **✅ Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **✅ Type Safety**: Full TypeScript support for better development experience
- **✅ Testing**: Comprehensive test suite with unit and E2E tests
- **✅ Production Ready**: Optimized API calls with proper error handling and timeouts
- **✅ CORS Support**: Configurable cross-origin resource sharing for multiple domains and ports

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Axios for HTTP requests
- **Database**: MongoDB with Mongoose (ready for production)
- **Testing**: Jest, React Testing Library, Cypress
- **Development**: ESLint, PostCSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (for production use)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd broadstreet-publishing
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Use your actual Broadstreet API token (not the demo token)
BROADSTREET_API_TOKEN=your-actual-api-token-here
BROADSTREET_API_BASE_URL=https://api.broadstreetads.com/api/1
MONGODB_URI=mongodb://localhost:27017/broadstreet-campaigns

# CORS Configuration - Add/remove origins as needed
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005,http://local.ft.tc,https://broad.travelm.de
```

**Important**: The correct API base URL is `https://api.broadstreetads.com/api/1` (not `/v1`).

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## API Integration

### Production Mode (Current)
The application is configured to work with real Broadstreet API data. It fetches campaigns from multiple networks and advertisers using the hierarchical API structure:

1. **Networks** → Get all available networks
2. **Advertisers** → Get advertisers for each network
3. **Campaigns** → Get campaigns for each advertiser

### Development Mode
For development/testing, you can use the demo token (`demo-token-for-development`) which will use mock campaign data instead of making real API calls.

### API Performance
- **Timeout**: 30 seconds for complex multi-network requests
- **Error Handling**: Graceful fallback to empty results on API errors
- **Rate Limiting**: Respects Broadstreet API rate limits
- **SSL Support**: Configured for development HTTPS endpoints

## API Endpoints

- `GET /api/networks` - Retrieve all networks
- `GET /api/advertisers` - Retrieve all advertisers for a given network
- `GET /api/campaigns` - Retrieve all campaigns for a given advertiser
- `GET /api/campaigns/[id]` - Retrieve specific campaign data
- `GET /api/zones` - Retrieve all zones for a given network
- `GET /api/advertisements` - Retrieve all advertisements for a given zone
- `GET /api/dashboard/summary` - Retrieve a summary of all data for the dashboard

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Start the development server first
npm run dev

# In another terminal, run Cypress tests
npx cypress run
# or for interactive mode
npx cypress open
```

### Test Coverage
```bash
npm test -- --coverage
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── advertisements/
│   │   ├── advertisers/
│   │   ├── campaigns/
│   │   ├── dashboard/
│   │   ├── networks/
│   │   └── zones/
│   ├── advertisements/      # Advertisements pages
│   ├── advertisers/         # Advertisers pages
│   ├── campaigns/           # Campaign pages
│   └── zones/               # Zones pages
├── components/            # React components
│   ├── AdvertisementGrid.tsx
│   ├── AdvertiserGrid.tsx
│   ├── CampaignDetail.tsx
│   ├── CampaignGrid.tsx
│   ├── CampaignList.tsx
│   ├── DashboardSummary.tsx
│   ├── Sidebar.tsx
│   └── ZoneGrid.tsx
├── lib/                   # Utility libraries
│   ├── data-services.ts
│   └── mongodb.ts
├── models/                # Database models
│   ├── Advertisement.ts
│   ├── Advertiser.ts
│   ├── campaign.ts
│   ├── campaignData.ts
│   ├── Network.ts
│   └── Zone.ts
├── services/              # API services
│   ├── campaignService.ts
│   ├── initializationService.ts
│   └── syncService.ts
└── types/                 # TypeScript type definitions
    └── campaign.ts

tests/
├── contract/              # Contract tests
├── integration/           # Integration tests
├── unit/                  # Unit tests
└── e2e/                   # End-to-end tests
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npx cypress run` - Run E2E tests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Documentation

- **[API Integration Guide](docs/API_INTEGRATION.md)** - Detailed information about Broadstreet API integration
- **[CORS Configuration Guide](docs/CORS_CONFIGURATION.md)** - Cross-origin resource sharing setup and configuration
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[API Specifications](docs/api-specs.json)** - Complete Broadstreet API documentation

## Current Status

### ✅ Production Ready Features
- Real Broadstreet API integration with complete data fetching
- Multi-network support (SCHWULISSIMO, Travel M)
- Real-time campaign status and statistics
- Complete advertisement management with network-based API approach
- Responsive dashboard interface
- Comprehensive error handling
- Production-optimized API calls

### 📊 Live Data
- **Total Networks**: 2 (FASH Medien Verlag GmbH)
- **Total Advertisers**: 45
- **Total Campaigns**: 28 (7 active, 21 paused)
- **Total Advertisements**: 101 (Network 9396: ~55, Network 9415: ~46)
- **Total Zones**: 620
- **API Status**: ✅ Fully Operational

## Support

For support, please create an issue in the repository or refer to the documentation above.
