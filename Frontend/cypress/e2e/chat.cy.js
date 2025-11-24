describe('Chat Feature', () => {
  beforeEach(() => {
    // Login como paciente
    cy.visit('/login');
    cy.get('[data-cy="login-email"]').type('franco.torrez.alv@gmail.com');
    cy.get('[data-cy="login-password"]').type('franco123');
    cy.get('[data-cy="login-submit"]').click();
    
    cy.url().should('not.include', '/login');
    cy.wait(500);
  });

  it('displays chat button for each service in dashboard', () => {
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        user: {
          _id: 'user123',
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
            caregiver: {
              _id: 'caregiver1',
              name: 'Ana Pérez',
              email: 'ana@example.com'
            }
          }
        ]
      }
    });

    cy.visit('/dashboard');
    
    // Verificar que existe el botón de chat
    cy.get('[data-cy="chat-service-service1"]').should('be.visible');
    cy.get('[data-cy="chat-service-service1"]').should('contain', 'Chat');
  });

  it('navigates to chat page when chat button is clicked', () => {
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        user: {
          _id: 'user123',
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
            caregiver: {
              _id: 'caregiver1',
              name: 'Ana Pérez',
              email: 'ana@example.com'
            }
          }
        ]
      }
    });

    cy.intercept('GET', '/api/users/caregiver1', {
      statusCode: 200,
      body: {
        user: {
          _id: 'caregiver1',
          name: 'Ana Pérez',
          email: 'ana@example.com',
          role: 'caregiver'
        }
      }
    });

    cy.visit('/dashboard');
    cy.get('[data-cy="chat-service-service1"]').click();
    
    cy.url().should('include', '/chat/caregiver1');
  });

  it('displays chat interface correctly', () => {
    cy.intercept('GET', '/api/users/caregiver1', {
      statusCode: 200,
      body: {
        user: {
          _id: 'caregiver1',
          name: 'Ana Pérez',
          email: 'ana@example.com',
          role: 'caregiver'
        }
      }
    });

    cy.visit('/chat/caregiver1');
    
    // Verificar elementos del chat
    cy.contains('Ana Pérez').should('be.visible');
    cy.contains('Volver').should('be.visible');
    cy.contains('Modo Demo').should('be.visible');
    cy.get('[data-cy="chat-input"]').should('be.visible');
    cy.get('[data-cy="chat-send"]').should('be.visible');
  });

  it('displays mock messages in chat', () => {
    cy.intercept('GET', '/api/users/caregiver1', {
      statusCode: 200,
      body: {
        user: {
          _id: 'caregiver1',
          name: 'Ana Pérez',
          email: 'ana@example.com',
          role: 'caregiver'
        }
      }
    });

    cy.visit('/chat/caregiver1');
    
    // Verificar que hay mensajes mock
    cy.contains('Gracias por tu interés en mi servicio').should('be.visible');
    cy.contains('me interesa el servicio').should('be.visible');
  });

  it('allows sending messages in chat', () => {
    cy.intercept('GET', '/api/users/caregiver1', {
      statusCode: 200,
      body: {
        user: {
          _id: 'caregiver1',
          name: 'Ana Pérez',
          email: 'ana@example.com',
          role: 'caregiver'
        }
      }
    });

    cy.visit('/chat/caregiver1');
    
    const testMessage = '¿Cuál es tu experiencia?';
    cy.get('[data-cy="chat-input"]').type(testMessage);
    cy.get('[data-cy="chat-send"]').click();
    
    // Verificar que el mensaje aparece
    cy.contains(testMessage).should('be.visible');
    
    // Verificar que el input se limpia
    cy.get('[data-cy="chat-input"]').should('have.value', '');
  });

  it('shows auto-reply after sending message', () => {
    cy.intercept('GET', '/api/users/caregiver1', {
      statusCode: 200,
      body: {
        user: {
          _id: 'caregiver1',
          name: 'Ana Pérez',
          email: 'ana@example.com',
          role: 'caregiver'
        }
      }
    });

    cy.visit('/chat/caregiver1');
    
    cy.get('[data-cy="chat-input"]').type('Hola');
    cy.get('[data-cy="chat-send"]').click();
    
    // Esperar respuesta automática
    cy.contains('Te responderé en breve', { timeout: 3000 }).should('be.visible');
  });

  it('disables send button when input is empty', () => {
    cy.intercept('GET', '/api/users/caregiver1', {
      statusCode: 200,
      body: {
        user: {
          _id: 'caregiver1',
          name: 'Ana Pérez',
          email: 'ana@example.com',
          role: 'caregiver'
        }
      }
    });

    cy.visit('/chat/caregiver1');
    
    // Botón debe estar deshabilitado cuando está vacío
    cy.get('[data-cy="chat-send"]').should('be.disabled');
    
    // Escribir texto
    cy.get('[data-cy="chat-input"]').type('Hola');
    
    // Botón debe estar habilitado
    cy.get('[data-cy="chat-send"]').should('not.be.disabled');
  });

  it('shows caregiver info in service card', () => {
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        user: {
          _id: 'user123',
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
            rate: 50,
            caregiver: {
              _id: 'caregiver1',
              name: 'María González',
              email: 'maria@example.com'
            }
          }
        ]
      }
    });

    cy.visit('/dashboard');
    
    // Verificar que se muestra la info del cuidador
    cy.contains('María González').should('be.visible');
    cy.contains('maria@example.com').should('be.visible');
  });

  it('back button returns to dashboard', () => {
    cy.intercept('GET', '/api/users/caregiver1', {
      statusCode: 200,
      body: {
        user: {
          _id: 'caregiver1',
          name: 'Ana Pérez',
          email: 'ana@example.com',
          role: 'caregiver'
        }
      }
    });

    cy.visit('/chat/caregiver1');
    
    cy.contains('Volver').click();
    cy.url().should('include', '/dashboard');
  });
});
