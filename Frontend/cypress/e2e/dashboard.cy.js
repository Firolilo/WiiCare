describe('Dashboard page (with real login)', () => {
  beforeEach(() => {
    // flujo de login real
    cy.visit('/login');
    cy.get('input[name="email"]').type('franco.torrez.alv@gmail.com');
    cy.get('input[name="password"]').type('franco123');
    cy.get('button[type="submit"]').click();

    // verifica login correcto
    cy.url().should('not.include', '/login');
  });

  it('shows loading state and then services list', () => {
    cy.intercept('GET', '/api/services', {
      statusCode: 200,
      delay: 300, // asegura que se muestre el "Cargando..."
      body: {
        services: [
          {
            _id: '1',
            title: 'Cuidado de adultos mayores',
            description: 'Atención personalizada y acompañamiento diario.',
            rate: 50,
          },
          {
            _id: '2',
            title: 'Asistencia médica a domicilio',
            description: 'Control de signos vitales y medicación básica.',
            rate: 70,
          },
        ],
      },
    }).as('getServices');

    cy.visit('/dashboard');
    cy.wait(100);
    cy.contains('Cargando servicios...').should('exist');
    cy.wait('@getServices');

    cy.contains('Servicios disponibles').should('exist');
    cy.contains('Cuidado de adultos mayores').should('exist');
    cy.contains('Asistencia médica a domicilio').should('exist');
    cy.contains('50 Bs/h').should('exist');
  });

  it('shows message when no services available', () => {
    cy.intercept('GET', '/api/services', {
      statusCode: 200,
      body: { services: [] },
    }).as('getEmptyServices');

    cy.visit('/dashboard');
    cy.wait('@getEmptyServices');
    cy.contains('No hay servicios registrados.').should('exist');
  });

  it('handles server error gracefully', () => {
    cy.intercept('GET', '/api/services', {
      statusCode: 500,
      body: { message: 'Error interno del servidor' },
    }).as('getError');

    cy.visit('/dashboard');
    cy.wait('@getError');

    // Cypress ignorará los errores Axios 500 si ya configuraste uncaught:exception
    cy.contains('No hay servicios registrados.').should('exist');
  });
});
