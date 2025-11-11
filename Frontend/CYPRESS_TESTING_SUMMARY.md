# WiiCare Frontend - Resumen de Pruebas E2E con Cypress

## 📊 Estado General de Pruebas

| Tipo de Prueba | Total | Pasaron | Fallaron | Estado |
|----------------|-------|---------|----------|--------|
| **Cypress E2E Tests** | 4 | 4 | 0 | ✅ 100% |

---

## 🧪 Cypress E2E Tests (4/4)

Ubicación: `Frontend/cypress/e2e/`

### Cobertura de Tests:

#### 1. **Auth Flow** (`auth.cy.js`)
**Pruebas incluidas:**
- ✅ Navegación a página de login
- ✅ Visualización de formulario de login
- ✅ Validación de campos requeridos
- ✅ Login exitoso con credenciales válidas
- ✅ Manejo de errores con credenciales inválidas
- ✅ Navegación a registro de usuarios
- ✅ Flujo completo de registro

**Escenarios cubiertos:**
- Usuario puede acceder a la página de login
- Validación de formularios funciona correctamente
- Autenticación exitosa redirige al dashboard
- Tokens se almacenan correctamente
- Mensajes de error se muestran apropiadamente

---

#### 2. **Dashboard Navigation** (`dashboard.cy.js`)
**Pruebas incluidas:**
- ✅ Renderizado correcto del dashboard
- ✅ Menú de navegación funcional
- ✅ Tarjetas de estadísticas visibles
- ✅ Navegación entre secciones
- ✅ Protección de rutas autenticadas
- ✅ Logout funcional

**Escenarios cubiertos:**
- Dashboard se carga después de login exitoso
- Navegación lateral funciona
- Estadísticas se muestran correctamente
- Usuario puede cerrar sesión
- Rutas protegidas redirigen a login

---

#### 3. **Services Management** (`services.cy.js`)
**Pruebas incluidas:**
- ✅ Listado de servicios
- ✅ Creación de nuevo servicio
- ✅ Edición de servicio existente
- ✅ Eliminación de servicio
- ✅ Búsqueda y filtrado de servicios
- ✅ Validación de formularios

**Escenarios cubiertos:**
- Cuidadores pueden publicar servicios
- Formularios de servicio validan correctamente
- CRUD completo de servicios funciona
- Búsqueda filtra servicios adecuadamente
- Confirmaciones de eliminación aparecen

---

#### 4. **Caregivers Search** (`caregivers.cy.js`)
**Pruebas incluidas:**
- ✅ Listado de cuidadores disponibles
- ✅ Filtros por ubicación
- ✅ Filtros por tipo de servicio
- ✅ Visualización de perfil de cuidador
- ✅ Solicitud de servicio
- ✅ Paginación de resultados

**Escenarios cubiertos:**
- Usuarios ven listado de cuidadores
- Filtros funcionan correctamente
- Perfiles de cuidadores son accesibles
- Solicitudes de servicio se envían
- Paginación carga más resultados

---

## 🎯 Cobertura de Funcionalidad

### Autenticación ✅
- [x] Login con email/password
- [x] Registro de nuevos usuarios
- [x] Validación de formularios
- [x] Manejo de tokens JWT
- [x] Logout
- [x] Redirección de rutas protegidas

### Gestión de Servicios ✅
- [x] Crear servicios (solo cuidadores)
- [x] Editar servicios propios
- [x] Eliminar servicios
- [x] Listar todos los servicios
- [x] Búsqueda y filtrado

### Búsqueda de Cuidadores ✅
- [x] Listado de cuidadores
- [x] Filtros por ubicación
- [x] Filtros por tipo de servicio
- [x] Ver perfil completo
- [x] Solicitar servicio

### Navegación y UX ✅
- [x] Dashboard funcional
- [x] Menú lateral responsive
- [x] Navegación entre secciones
- [x] Protección de rutas
- [x] Feedback visual (loading, errores)

---

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Modo Headless (para CI/CD)
```bash
cd Frontend
npm run test:e2e
```

### Opción 2: Script Visual
```bash
cd Frontend
.\run-cypress-tests.ps1
```

### Opción 3: Modo Interactivo (con UI de Cypress)
```bash
cd Frontend
npm run cypress:open
```

---

## 📋 Prerrequisitos

Antes de ejecutar las pruebas, asegúrate de:

1. **Backend corriendo:**
   ```bash
   cd Backend
   node server.js
   ```
   Debe estar en: `http://192.168.0.27:4000`

2. **Base de datos accesible:**
   - MongoDB Atlas debe estar disponible
   - Usuarios de prueba deben existir

3. **Dependencias instaladas:**
   ```bash
   cd Frontend
   npm install
   ```

---

## 🔧 Configuración de Cypress

**Archivo:** `cypress.config.js`

```javascript
export default {
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
  },
}
```

**Variables de entorno:** Crear archivo `cypress.env.json`
```json
{
  "apiUrl": "http://192.168.0.27:4000/api",
  "testUser": {
    "email": "test@example.com",
    "password": "password123"
  }
}
```

---

## 📊 Reportes y Evidencias

### Videos de Tests
Ubicación: `Frontend/cypress/videos/`
- Se generan automáticamente en cada ejecución
- Útiles para debugging de fallos

### Screenshots
Ubicación: `Frontend/cypress/screenshots/`
- Se capturan solo cuando hay fallos
- Muestran el estado exacto del error

### Reportes HTML
Para generar reportes HTML:
```bash
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
```

---

## 🎓 Para la Presentación

### Demostración Recomendada:

1. **Mostrar estructura de tests:**
   ```
   code cypress/e2e/
   ```

2. **Ejecutar con script visual:**
   ```
   .\run-cypress-tests.ps1
   ```

3. **Mostrar Cypress UI (opcional):**
   ```
   npm run cypress:open
   ```
   - Seleccionar un test
   - Ver ejecución en vivo
   - Mostrar Time Travel debugging

4. **Explicar cobertura:**
   - "4 archivos de tests E2E"
   - "Cubren autenticación, navegación, servicios y búsqueda"
   - "Tests se ejecutan en navegador real"
   - "Simulan comportamiento de usuario real"

---

## 💡 Beneficios de Cypress

- ✅ **Tests en navegador real:** Chrome, Firefox, Edge
- ✅ **Time Travel:** Debug visual de cada paso
- ✅ **Auto-waiting:** Espera automática por elementos
- ✅ **Screenshots y videos:** Evidencia automática
- ✅ **Fast, easy and reliable:** Setup simple y rápido
- ✅ **CI/CD ready:** Integración con GitHub Actions

---

## 🔍 Comandos Útiles

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar un test específico
npx cypress run --spec "cypress/e2e/auth.cy.js"

# Modo interactivo
npm run cypress:open

# Generar reporte
npm run test:e2e -- --reporter mochawesome

# Limpiar cache
npx cypress cache clear
```

---

## 🚨 Troubleshooting

### Si fallan los tests:

1. **Verificar backend:**
   ```bash
   curl http://192.168.0.27:4000/api/health
   ```

2. **Verificar variables de entorno:**
   - Crear `cypress.env.json` si no existe
   - Verificar URLs correctas

3. **Limpiar estado:**
   ```bash
   rm -rf cypress/videos cypress/screenshots
   npx cypress cache clear
   npm install
   ```

4. **Verificar versión de Cypress:**
   ```bash
   npx cypress --version
   # Debe ser >= 12.0.0
   ```

---

**Última actualización:** 11 de Noviembre, 2025  
**Estado:** ✅ Todas las pruebas E2E pasando  
**Framework:** Cypress 13.x
