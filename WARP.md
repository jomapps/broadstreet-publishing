# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Broadstreet Publishing Dashboard is a Next.js 14 application that manages advertising campaigns through the Broadstreet API. The application uses a hierarchical data fetching approach (Networks → Advertisers → Campaigns) and runs on port 3005 by default.

## Quick Start Commands

### Development
```bash
npm run dev          # Start development server on port 3005
npm run build        # Build for production  
npm start           # Start production server on port 3005
npm run lint        # Run ESLint
```

### Testing
```bash
npm test                    # Run unit tests
npm run test:watch         # Run tests in watch mode
npm test -- --coverage    # Run tests with coverage
npx cypress run            # Run E2E tests (requires dev server running)
npx cypress open           # Open Cypress UI
```

### Environment Setup
```bash
cp .env.local.example .env.local  # Copy environment template
```

Required environment variables:
- `BROADSTREET_API_TOKEN`: Your Broadstreet API token (use "demo-token-for-development" for mock data)
- `BROADSTREET_API_BASE_URL`: https://api.broadstreetads.com/api/1 (note: /api/1, not /v1)
- `MONGODB_URI`: MongoDB connection string

## Architecture Overview

### API Integration Strategy
The application uses a **hierarchical API fetching pattern**:
1. Fetch Networks from `/networks`
2. For each Network, fetch Advertisers from `/advertisers?network_id={id}`
3. For each Advertiser, fetch Campaigns from `/campaigns?advertiser_id={id}`

This pattern is implemented in `src/services/campaignService.ts` with:
- 30-second timeout for complex multi-network requests
- Processing limited to first 10 advertisers per network to avoid timeouts
- Graceful fallback to empty arrays on API errors
- SSL certificate bypass for development mode

### Data Flow Architecture
- **API Routes** (`src/app/api/*/route.ts`): Next.js API routes that proxy to Broadstreet API
- **Services** (`src/services/`): Business logic layer handling external API calls
- **Components** (`src/components/`): React components with built-in loading and error states
- **Types** (`src/types/`): Shared TypeScript interfaces for all entities

### Key Architectural Patterns
- **Server-Side Rendering (SSR)**: Default for pages, with client components only when necessary
- **Context Pattern**: `NetworkContext` for sharing network state across components
- **Service Layer Pattern**: Centralized API logic in `campaignService.ts`
- **Error Boundary Pattern**: Comprehensive error handling at API and component levels

## Development Workflow & Scripts

### Feature Development Process
The repository follows a **spec-driven, TDD approach** with automated tooling:

```bash
./scripts/create-new-feature.sh "feature description"  # Creates numbered branch + spec directory
./scripts/setup-plan.sh                                # Sets up implementation plan
./scripts/check-task-prerequisites.sh                  # Validates feature branch setup
```

### Constitution & Standards
Defined in `memory/constitution.md`:
- **Test-First Development**: TDD is non-negotiable (Red-Green-Refactor cycle)
- **Spec-Driven**: Every feature begins with a specification
- **Plan-Driven**: Specs followed by technical implementation plans
- **Next.js Best Practices**: SSR by default, RSC components where possible

### Byterover Integration
The project integrates with Byterover MCP tools (see `.github/copilot-instructions.md`):
- **Knowledge Management**: Store/retrieve implementation knowledge
- **Onboarding Workflow**: Handbook creation and sync
- **Planning Workflow**: Implementation plan persistence and progress tracking
- **Module Management**: Storing and searching project modules

Always use Byterover tools in sequence: onboarding → planning → execution with frequent progress updates.

## Project Structure

### Core Application Structure
```
src/
├── app/                    # Next.js app directory (App Router)
│   ├── api/               # API routes (campaigns, networks, advertisers, etc.)
│   ├── campaigns/         # Campaign pages with dynamic routing
│   ├── layout.tsx         # Root layout with Sidebar + NetworkProvider
│   └── page.tsx           # Dashboard home page
├── components/            # React components (grids, details, skeletons)
├── contexts/              # React contexts (NetworkContext)
├── lib/                   # Utilities (MongoDB connection)
├── models/               # Database models (Mongoose schemas)
├── services/             # API services (campaignService.ts)
└── types/                # TypeScript interfaces
```

### Testing Structure
```
tests/
├── unit/                 # Component unit tests (Jest + React Testing Library)
├── integration/          # API integration tests
├── e2e/                 # Cypress end-to-end tests
└── contract/            # API contract tests
```

### Development Tooling
```
scripts/                  # Bash scripts for feature workflow
templates/                # Templates for specs, plans, tasks
memory/                   # Constitution and development standards
docs/                     # API integration and deployment guides
```

## Testing Approach

### Test Configuration
- **Unit Tests**: Jest with `jest-environment-jsdom`, React Testing Library
- **E2E Tests**: Cypress configured for `http://localhost:3001` (note: different from dev server port)
- **Coverage**: Configured to exclude layout, types, and CSS files
- **Mocks**: Next.js router and navigation mocked in jest.setup.js

### Critical Test Patterns
- **Component Testing**: Loading states, error handling, data display, user interactions
- **API Testing**: Contract tests for Broadstreet API integration
- **Integration Testing**: Full API-to-UI flow testing

### Running Tests
The E2E tests expect the application to run on port 3001, but the dev server runs on 3005. This discrepancy needs to be resolved by either:
- Starting dev server with `next dev -p 3001`, or
- Updating `cypress.config.js` to use port 3005

## API Integration Details

### Broadstreet API Specifics
- **Base URL**: `https://api.broadstreetads.com/api/1` (not `/v1`)
- **Authentication**: Query parameter `access_token`
- **Rate Limiting**: API respects rate limits with proper error codes
- **Timeout Handling**: 30-second timeout for complex operations
- **Demo Mode**: Use token "demo-token-for-development" for mock data

### Production vs Development
- **Production**: Uses real Broadstreet API token, fetches live data
- **Development**: Can use demo token for mock campaign data
- **SSL**: Development mode includes certificate bypass for local testing

### Performance Considerations
- **Limited Scope**: First 10 advertisers per network to prevent timeouts
- **Error Graceful**: Always returns empty arrays rather than throwing errors
- **Caching**: Frontend caching reduces API calls during user sessions

## Common Development Tasks

### Adding New Entity Types
1. Define TypeScript interfaces in `src/types/campaign.ts`
2. Create API route in `src/app/api/{entity}/route.ts`
3. Add service methods in appropriate service file
4. Create components for display (List, Detail, Grid, Skeleton)
5. Add unit tests following existing patterns

### Debugging API Issues
- Check console logs for detailed API request/response information
- Verify environment variables are correctly set
- Ensure using correct Broadstreet API base URL (`/api/1`)
- Test with demo token first to isolate API vs code issues

### Working with the Feature Workflow
1. Use `./scripts/create-new-feature.sh` to start new features
2. Follow spec → plan → implementation → testing cycle
3. Use TDD: write tests first, then implement
4. Update Byterover knowledge after significant implementations

## Important Notes

- **Port Configuration**: Development server runs on 3005, but E2E tests expect 3001
- **API Token**: Never commit real API tokens; use demo token for development
- **TDD Requirement**: All new features must follow Test-Driven Development
- **Byterover Workflow**: Always start with onboarding workflow in new sessions
- **Error Handling**: API errors should gracefully degrade, never crash the UI

For detailed API integration information, see `docs/API_INTEGRATION.md`.
For deployment instructions, see `docs/DEPLOYMENT.md`.
