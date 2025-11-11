describe('Caregivers page (with real login)', () => {
  beforeEach(() => {
    // Real login flow
    cy.visit('/login');

    cy.get('input[name="email"]').type('franco.torrez.alv@gmail.com');
    cy.get('input[name="password"]').type('franco123');
    cy.get('button[type="submit"]').click();

    // espera a que redireccione al dashboard o home
    cy.url().should('not.include', '/login');
  });

  it('shows caregivers list after login', () => {
    // intercepta la respuesta real o simula la API
    cy.intercept('GET', '/api/users/caregivers', {
      statusCode: 200,
      body: {
        caregivers: [
          { _id: '1', name: 'Ana Pérez', location: 'La Paz', rating: 4.8 },
          { _id: '2', name: 'Carlos Gómez', location: 'Santa Cruz', rating: 4.5 },
        ],
      },
    }).as('getCaregivers');

    cy.visit('/cuidadores');

    cy.contains('Cargando cuidadores...').should('exist');
    cy.wait('@getCaregivers');

    cy.contains('Cuidadores registrados').should('exist');
    cy.contains('Ana Pérez').should('exist');
    cy.contains('Carlos Gómez').should('exist');
  });

  it('shows empty message when no caregivers', () => {
    cy.intercept('GET', '/api/users/caregivers', {
      statusCode: 200,
      body: { caregivers: [] },
    }).as('getEmptyCaregivers');

    cy.visit('/cuidadores');
    cy.wait('@getEmptyCaregivers');
    cy.contains('No hay cuidadores disponibles.').should('exist');
  });

  it('handles server error gracefully', () => {
    cy.intercept('GET', '/api/users/caregivers', {
      statusCode: 500,
      body: { message: 'Error del servidor' },
    }).as('getError');

    cy.visit('/cuidadores');
    cy.wait('@getError');
    cy.contains('No hay cuidadores disponibles.').should('exist');
  });
});
