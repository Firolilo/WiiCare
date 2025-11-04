describe('Services page smoke', () => {
  it('loads dashboard behind auth redirect', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});
