# Tasks: Campaign Management Dashboard

**Input**: Design documents from `/specs/001-i-want-to/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/

## Phase 1: Initial Setup (Done)
- [x] T001 Create Next.js project structure.
- [x] T002 Initialize Next.js project.
- [x] T003 Configure linting and formatting.
- [x] T004 Install dependencies: mongoose, tailwindcss.

## Phase 2: Backend - Core Implementation (Done)
- [x] T005 [P] Contract test for `GET /api/campaigns` in `tests/contract/test_campaigns_get.js`.
- [x] T006 [P] Contract test for `GET /api/campaigns/{id}` in `tests/contract/test_campaign_get.js`.
- [x] T007 [P] Integration test for fetching campaigns in `tests/integration/test_campaigns.js`.
- [x] T008 [P] Campaign model in `models/campaign.js` using Mongoose.
- [x] T009 [P] CampaignData model in `models/campaignData.js` using Mongoose.
- [x] T010 Campaign service in `services/campaignService.js` to interact with Broadstreet API.
- [x] T011 `GET /api/campaigns` endpoint in `pages/api/campaigns/index.js`.
- [x] T012 `GET /api/campaigns/{id}` endpoint in `pages/api/campaigns/[id].js`.
- [x] T013 Input validation for API endpoints.
- [x] T014 Error handling and logging for API endpoints.

## Phase 3: Frontend - UI Implementation (Done)
- [x] T015 [P] Create a sidebar component in `components/Sidebar.js`.
- [x] T016 [P] Create a campaign list component in `components/CampaignList.js`.
- [x] T017 [P] Create a campaign detail component in `components/CampaignDetail.js`.
- [x] T018 Create the main dashboard page at `pages/index.js` to display the sidebar and campaign list.
- [x] T019 Create a dynamic page for campaign details at `pages/campaigns/[id].js`.
- [x] T020 Implement data fetching in the frontend to call the backend APIs.
- [x] T021 Style the application with Tailwind CSS.

## Phase 4: New Features (Done)
- [x] T022 Create AdvertiserGrid component.
- [x] T023 Create AdvertisementGrid component.
- [x] T024 Create ZoneGrid component.
- [x] T025 Create DashboardSummary component.
- [x] T026 Create API route for advertisers.
- [x] T027 Create API route for advertisements.
- [x] T028 Create API route for zones.
- [x] T029 Create API route for dashboard summary.

## Phase 5: Polish & Testing (Done)
- [x] T030 [P] Unit tests for frontend components.
- [x] T031 [P] E2E test for viewing the campaign list and details using Cypress.
- [x] T032 [P] Update documentation (`README.md`) with setup and usage instructions.
- [x] T033 Review and refactor code for clarity and performance.

## Phase 6: Future Enhancements (Pending)
- [ ] T034 Implement pagination for large data sets.
- [ ] T035 Implement Redis or other caching for API responses.
- [ ] T036 Implement real-time updates with WebSockets.
- [ ] T037 Optimize API calls with batch processing.