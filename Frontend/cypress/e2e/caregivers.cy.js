describe('Caregivers page (with real login)', () => {
  beforeEach(() => {
    // Interceptar TODAS las llamadas a /api/auth/me para evitar redirecciones
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        user: {
          _id: '123',
          name: 'Franco',
          email: 'franco.torrez.alv@gmail.com',
          role: 'user'
        }
      }
    }).as('authMe');

    // Real login flow
    cy.visit('/login');

    cy.get('[data-cy="login-email"]').type('franco.torrez.alv@gmail.com');
    cy.get('[data-cy="login-password"]').type('franco123');
    cy.get('[data-cy="login-submit"]').click();

    // espera a que redireccione al dashboard o home
    cy.url().should('not.include', '/login');
  });

  it('shows caregivers list after login', () => {
    // intercepta la respuesta real o simula la API
    cy.intercept('GET', '/api/users/caregivers', {
      statusCode: 200,
      delay: 300,
      body: {
        caregivers: [
          { _id: '1', name: 'Ana Pérez', location: 'La Paz', rating: 4.8 },
          { _id: '2', name: 'Carlos Gómez', location: 'Santa Cruz', rating: 4.5 },
        ],
      },
    }).as('getCaregivers');

    cy.visit('/cuidadores');

    cy.contains('Cargando cuidadores...', { timeout: 10000 }).should('be.visible');
    cy.wait('@getCaregivers');

    cy.contains('Cuidadores registrados').should('be.visible');
    cy.contains('Ana Pérez').should('be.visible');
    cy.contains('Carlos Gómez').should('be.visible');
  });

  it('shows empty message when no caregivers', () => {
    cy.intercept('GET', '/api/users/caregivers', {
      statusCode: 200,
      body: { caregivers: [] },
    }).as('getEmptyCaregivers');

    cy.visit('/cuidadores');
    cy.wait('@getEmptyCaregivers');
    cy.contains('No hay cuidadores disponibles.').should('be.visible');
  });

  it('handles server error gracefully', () => {
    // Ignorar errores de Axios 500 en este test
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Request failed with status code 500')) {
        return false;
      }
    });

    cy.intercept('GET', '/api/users/caregivers', {
      statusCode: 500,
      body: { message: 'Error del servidor' },
    }).as('getError');

    cy.visit('/cuidadores');
    cy.wait('@getError');
    cy.contains('No hay cuidadores disponibles.', { timeout: 10000 }).should('be.visible');
  });
});
