describe('Create Service (Caregiver only)', () => {
  beforeEach(() => {
    // Login como cuidador
    cy.visit('/login');
    cy.get('[data-cy="toggle-auth-mode"]').click(); // Cambiar a registro
    
    const randomEmail = `caregiver${Date.now()}@test.com`;
    cy.get('[data-cy="register-name"]').type('Test Caregiver');
    cy.get('[data-cy="register-role"]').select('caregiver');
    cy.get('[data-cy="login-email"]').clear().type(randomEmail);
    cy.get('[data-cy="login-password"]').type('password123');
    cy.get('[data-cy="login-submit"]').click();
    
    cy.url().should('not.include', '/login');
    cy.wait(500);
  });

  it('caregiver can access create service page from navbar', () => {
    cy.contains('Crear Servicio').should('be.visible');
    cy.contains('Crear Servicio').click();
    cy.url().should('include', '/crear-servicio');
    cy.contains('Crear Nuevo Servicio').should('be.visible');
  });

  it('caregiver can access create service page from dashboard', () => {
    cy.visit('/dashboard');
    cy.contains('Crear Servicio').should('be.visible').click();
    cy.url().should('include', '/crear-servicio');
  });

  it('caregiver can create a new service successfully', () => {
    cy.intercept('POST', '/api/services', {
      statusCode: 201,
      body: {
        service: {
          _id: 'test123',
          title: 'Cuidado de adultos mayores',
          description: 'Servicio profesional de cuidado',
          rate: 50,
          tags: ['TEA', 'Adultos'],
          location: 'La Paz'
        }
      }
    }).as('createService');

    cy.visit('/crear-servicio');
    
    cy.get('[data-cy="service-title"]').type('Cuidado de adultos mayores');
    cy.get('[data-cy="service-description"]').type('Servicio profesional de cuidado con más de 5 años de experiencia');
    cy.get('[data-cy="service-rate"]').type('50');
    cy.get('[data-cy="service-location"]').type('La Paz');
    cy.get('[data-cy="service-tags"]').type('TEA, Adultos');
    
    cy.get('[data-cy="service-submit"]').click();
    
    cy.wait('@createService');
    cy.contains('Servicio creado exitosamente').should('be.visible');
  });

  it('shows validation errors for empty required fields', () => {
    cy.visit('/crear-servicio');
    
    cy.get('[data-cy="service-submit"]').click();
    
    cy.contains('completa los campos obligatorios').should('be.visible');
  });

  it('shows validation error for invalid rate', () => {
    cy.visit('/crear-servicio');
    
    cy.get('[data-cy="service-title"]').type('Test Service');
    cy.get('[data-cy="service-description"]').type('Test description');
    cy.get('[data-cy="service-rate"]').type('-10');
    
    cy.get('[data-cy="service-submit"]').click();
    
    cy.contains('debe ser un número mayor a 0').should('be.visible');
  });
});

describe('Service Selection (Patient only)', () => {
  beforeEach(() => {
    // Login como paciente (user)
    cy.visit('/login');
    cy.get('[data-cy="login-email"]').type('franco.torrez.alv@gmail.com');
    cy.get('[data-cy="login-password"]').type('franco123');
    cy.get('[data-cy="login-submit"]').click();
    
    cy.url().should('not.include', '/login');
    cy.wait(500);
  });

  it('patient cannot see "Crear Servicio" button in navbar', () => {
    cy.contains('Crear Servicio').should('not.exist');
  });

  it('patient can select services in dashboard', () => {
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
    });

    cy.intercept('GET', '/api/services', {
      statusCode: 200,
      body: {
        services: [
          {
            _id: 'service1',
            title: 'Cuidado de niños',
            description: 'Experiencia con TEA',
            rate: 30,
            tags: ['TEA', 'Infantil'],
            location: 'La Paz'
          },
          {
            _id: 'service2',
            title: 'Cuidado de adultos',
            description: 'Cuidado profesional',
            rate: 50,
            tags: ['Adultos'],
            location: 'Cochabamba'
          }
        ]
      }
    });

    cy.visit('/dashboard');
    
    // Verificar que los botones de selección existen
    cy.get('[data-cy="select-service-service1"]').should('be.visible');
    cy.get('[data-cy="select-service-service2"]').should('be.visible');
    
    // Seleccionar primer servicio
    cy.get('[data-cy="select-service-service1"]').click();
    cy.get('[data-cy="select-service-service1"]').should('contain', 'Seleccionado');
    
    // Verificar que aparece el resumen
    cy.contains('1 servicio seleccionado').should('be.visible');
    
    // Seleccionar segundo servicio
    cy.get('[data-cy="select-service-service2"]').click();
    cy.contains('2 servicios seleccionados').should('be.visible');
    
    // Deseleccionar primer servicio
    cy.get('[data-cy="select-service-service1"]').click();
    cy.contains('1 servicio seleccionado').should('be.visible');
  });

  it('patient can see service details (tags, location)', () => {
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
    });

    cy.intercept('GET', '/api/services', {
      statusCode: 200,
      body: {
        services: [
          {
            _id: 'service1',
            title: 'Cuidado especializado',
            description: 'Servicio completo',
            rate: 60,
            tags: ['TEA', 'Infantil', 'Especializado'],
            location: 'Santa Cruz'
          }
        ]
      }
    });

    cy.visit('/dashboard');
    
    // Verificar tags
    cy.contains('TEA').should('be.visible');
    cy.contains('Infantil').should('be.visible');
    cy.contains('Especializado').should('be.visible');
    
    // Verificar ubicación
    cy.contains('📍 Santa Cruz').should('be.visible');
    
    // Verificar tarifa
    cy.contains('60 Bs/h').should('be.visible');
  });
});
