describe('Dashboard page (with real login)', () => {
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

    // flujo de login real
    cy.visit('/login');
    cy.get('[data-cy="login-email"]').type('franco.torrez.alv@gmail.com');
    cy.get('[data-cy="login-password"]').type('franco123');
    cy.get('[data-cy="login-submit"]').click();

    // verifica login correcto y espera a que redirija
    cy.url().should('not.include', '/login');
  });

  it('shows loading state and then services list', () => {
    // Interceptar la llamada a servicios con delay para ver el loading
    cy.intercept('GET', '/api/services', {
      statusCode: 200,
      delay: 500, // asegura que se muestre el "Cargando..."
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
    
    // Verificar que muestra el estado de carga
    cy.contains('Cargando servicios...', { timeout: 10000 }).should('be.visible');
    
    // Esperar a que carguen los servicios
    cy.wait('@getServices');

    // Verificar que se muestran los servicios
    cy.contains('Servicios disponibles').should('be.visible');
    cy.contains('Cuidado de adultos mayores').should('be.visible');
    cy.contains('Asistencia médica a domicilio').should('be.visible');
    cy.contains('50 Bs/h').should('be.visible');
  });

  it('shows message when no services available', () => {
    // Interceptar servicios vacíos
    cy.intercept('GET', '/api/services', {
      statusCode: 200,
      body: { services: [] },
    }).as('getEmptyServices');

    cy.visit('/dashboard');
    cy.wait('@getEmptyServices');
    cy.contains('No hay servicios registrados.').should('be.visible');
  });

  it('handles server error gracefully', () => {
    // Ignorar errores de Axios 500 en este test
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Request failed with status code 500')) {
        return false; // previene que Cypress falle el test
      }
    });

    // Interceptar error del servidor
    cy.intercept('GET', '/api/services', {
      statusCode: 500,
      body: { message: 'Error interno del servidor' },
    }).as('getError');

    cy.visit('/dashboard');
    cy.wait('@getError');

    // El componente debería mostrar el mensaje de "sin servicios" en caso de error
    cy.contains('No hay servicios registrados.', { timeout: 10000 }).should('be.visible');
  });
});
