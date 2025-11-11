describe('Auth flow', () => {
  it('visits home and navigates to login', () => {
    cy.visit('/');
    cy.contains('WiiCare');
    cy.contains('Entrar').click();
    cy.url().should('include', '/login');
    cy.contains('Iniciar sesión');
  });
});
