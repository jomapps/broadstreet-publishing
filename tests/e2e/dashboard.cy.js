describe('Campaign Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Visit the dashboard page
    cy.visit('/');
  });

  it('should display the dashboard with sidebar and campaign list', () => {
    // Check if sidebar is visible
    cy.contains('Broadstreet Dashboard').should('be.visible');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Campaigns').should('be.visible');

    // Check if main content is visible
    cy.contains('Welcome to your Broadstreet campaign management dashboard').should('be.visible');
    
    // Wait for campaigns to load and check if they are displayed
    cy.contains('Your Campaigns', { timeout: 10000 }).should('be.visible');
    
    // Check if mock campaigns are loaded
    cy.contains('Summer Sale Campaign', { timeout: 10000 }).should('be.visible');
    cy.contains('Back to School Promotion', { timeout: 10000 }).should('be.visible');
  });

  it('should navigate to campaigns page', () => {
    // Click on Campaigns in sidebar
    cy.contains('Campaigns').click();
    
    // Check if we're on the campaigns page
    cy.url().should('include', '/campaigns');
    cy.contains('Manage and monitor all your advertising campaigns').should('be.visible');
    
    // Check if campaigns are displayed
    cy.contains('Summer Sale Campaign', { timeout: 10000 }).should('be.visible');
  });

  it('should navigate to individual campaign detail page', () => {
    // Wait for campaigns to load
    cy.contains('Summer Sale Campaign', { timeout: 10000 }).should('be.visible');
    
    // Click on a campaign
    cy.contains('Summer Sale Campaign').click();
    
    // Check if we're on the campaign detail page
    cy.url().should('include', '/campaigns/1');
    cy.contains('Campaign #1 Performance', { timeout: 10000 }).should('be.visible');
    
    // Check if campaign stats are displayed
    cy.contains('Impressions').should('be.visible');
    cy.contains('Clicks').should('be.visible');
    cy.contains('Click-Through Rate').should('be.visible');
    cy.contains('Total Spend').should('be.visible');
  });

  it('should handle campaign refresh functionality', () => {
    // Wait for campaigns to load
    cy.contains('Summer Sale Campaign', { timeout: 10000 }).should('be.visible');
    
    // Click refresh button
    cy.contains('Refresh').click();
    
    // Campaigns should still be visible after refresh
    cy.contains('Summer Sale Campaign', { timeout: 10000 }).should('be.visible');
  });

  it('should display campaign status badges correctly', () => {
    // Wait for campaigns to load
    cy.contains('Summer Sale Campaign', { timeout: 10000 }).should('be.visible');
    
    // Check status badges
    cy.contains('active').should('be.visible').and('have.class', 'bg-green-100');
    cy.contains('paused').should('be.visible').and('have.class', 'bg-yellow-100');
  });

  it('should navigate back from campaign detail page', () => {
    // Navigate to campaign detail
    cy.contains('Summer Sale Campaign', { timeout: 10000 }).click();
    cy.url().should('include', '/campaigns/1');
    
    // Click back button
    cy.contains('Back to Campaigns').click();
    
    // Should be back on campaigns page
    cy.url().should('include', '/campaigns');
    cy.contains('Manage and monitor all your advertising campaigns').should('be.visible');
  });
});
