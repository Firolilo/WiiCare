// Cypress support file

// Interceptar TODOS los errores no capturados y solo fallar si no son errores esperados
Cypress.on('uncaught:exception', (err, runnable) => {
  // No fallar el test por errores de red que esperamos manejar
  if (err.message.includes('Request failed with status code')) {
    return false; // previene que Cypress falle
  }
  if (err.message.includes('Network Error')) {
    return false;
  }
  // Permitir que otros errores fallen el test normalmente
  return true;
});
