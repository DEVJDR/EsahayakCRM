describe('Buyer Leads Management', () => {
  beforeEach(() => {
    cy.login(); // Assume login command is defined
    cy.visit('/buyers');
  });

  it('displays buyer leads table', () => {
    cy.get('h1').should('contain', 'Buyer Leads');
    cy.get('table').should('be.visible');
    cy.get('tbody td').should('contain', 'Loading...'); // Initial state
    cy.wait(1000); // Allow time for fetch (adjust as needed)
    cy.get('tbody td').should('contain', 'John Doe'); // Assuming mock data
  });

  it('navigates to new buyer form and submits', () => {
    cy.get('a[aria-label="Create new buyer"]').click();
    cy.url().should('include', '/buyers/new');
    cy.get('input[name="full_name"]').type('Jane Doe');
    cy.get('input[name="phone"]').type('9876543210');
    cy.get('button[aria-label="Save buyer"]').click();
    cy.wait('@login'); // If API call is mocked
    cy.get('.text-red-600').should('not.exist'); // No errors
    cy.contains('Buyer saved successfully!').should('be.visible');
    cy.visit('/buyers');
    cy.get('tbody td').should('contain', 'Jane Doe');
  });

  it('edits an existing buyer', () => {
    cy.visit('/buyers');
    cy.wait(1000); // Allow data to load
    cy.get('a[aria-label="Edit buyer John Doe"]').click();
    cy.url().should('match', /\/buyers\/[0-9]+\/edit/);
    cy.get('input[name="full_name"]').clear().type('John Doe Updated');
    cy.get('button[aria-label="Save changes"]').click();
    cy.contains('Lead updated successfully!').should('be.visible');
    cy.visit('/buyers');
    cy.get('tbody td').should('contain', 'John Doe Updated');
  });
});