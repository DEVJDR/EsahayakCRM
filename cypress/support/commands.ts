declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
  }
}

Cypress.Commands.add('login', () => {
  // Mock or simulate login (adjust based on your AuthProvider)
  cy.setCookie('session', JSON.stringify({ user: { id: 'user1' } }));
  // Alternatively, intercept API calls to mock authentication
  cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { user: { id: 'user1' } } }).as('login');
});