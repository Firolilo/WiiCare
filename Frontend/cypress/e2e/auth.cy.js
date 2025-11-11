// Frontend/cypress/e2e/auth.cy.test.js
describe('Auth flow extended tests', () => {
  it('logs in successfully with valid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('franco.torrez.alv@gmail.com');
    cy.get('input[name="password"]').type('franco123');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.contains('Bienvenido').should('exist');
  });

  it('shows error on login with invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('wronguser@example.com');
    cy.get('input[name="password"]').type('WrongPassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Credenciales inválidas').should('exist');
  });

  it('toggles password visibility', () => {
    cy.visit('/login');
    cy.get('input[name="password"]').type('TestPassword123');
    cy.get('[data-testid="toggle-password-visibility"]').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
  });

  it('shows validation errors for empty fields', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.contains('El correo es requerido').should('exist');
  });
});