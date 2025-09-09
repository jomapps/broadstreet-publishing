# Research & Discovery

## Summary of Findings

This document outlines the research conducted to resolve ambiguities in the feature specification and technical context.

### 1. Broadstreet API Authentication

- **Decision**: Use an access token sent as a query parameter.
- **Rationale**: The Broadstreet API documentation specifies that authentication is handled via an `access_token` query parameter.
- **Alternatives Considered**: None, as the API documentation was clear.

### 2. Testing Frameworks

- **Decision**: Use Jest with React Testing Library for unit and integration tests, and Cypress for end-to-end tests.
- **Rationale**: This is a widely adopted and recommended best practice for Next.js applications, providing a comprehensive testing strategy.
- **Alternatives Considered**: Playwright was considered for E2E testing but Cypress is chosen for its developer experience.

### 3. Performance Goals

- **Decision**: Target a Largest Contentful Paint (LCP) of less than 2.5 seconds and a Time to First Byte (TTFB) of under 200ms.
- **Rationale**: These are industry-standard benchmarks for a good user experience.
- **Alternatives Considered**: Stricter goals were considered but these provide a reasonable starting point.

### 4. API Rate Limits

- **Decision**: Assume a standard rate limit (e.g., 100 requests per minute) and implement handling for `429 Too Many Requests` responses.
- **Rationale**: The Broadstreet API documentation did not specify rate limits. This is a common practice and a safe assumption to start with. This needs to be clarified with the Broadstreet API provider.
- **Alternatives Considered**: No rate limit handling, which would be risky.

### 5. Graceful Error Handling

- **Decision**: Implement error handling using Next.js's `error.js` for route-level errors, `try/catch` blocks for server-side logic, and provide user-friendly error messages with options to retry.
- **Rationale**: This follows Next.js best practices and ensures a robust and user-friendly application.
- **Alternatives Considered**: A global error boundary, but `error.js` provides more granular control.
