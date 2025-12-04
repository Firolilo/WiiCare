# Sistema de Gestión de Pacientes para Cuidadores - WiiCare

## Descripción General

Este sistema permite a los cuidadores gestionar de manera integral a sus pacientes, y a los pacientes ver toda la información registrada por su cuidador en un panel espejo.

## 🎯 Características Principales

### Para Cuidadores

1. **Gestión de Solicitudes de Servicio**
   - Ver solicitudes pendientes de pacientes
   - Aceptar o rechazar solicitudes
   - Al aceptar, se crea automáticamente el perfil del paciente
   - Se aplica plantilla de cuidado según tipo de paciente

2. **Panel de Gestión de Pacientes**
   - Lista de todos los pacientes activos
   - Acceso rápido al perfil completo de cada paciente
   - Filtros por estado (activo/inactivo)

3. **Gestión Integral por Paciente**
   
   #### Cuidados Diarios
   - Crear tareas organizadas por categoría (higiene, medicación, nutrición, ejercicio, terapia, monitoreo)
   - Programar hora específica para cada tarea
   - Marcar como completadas con notas
   - Vista por fecha
   
   #### Medicamentos
   - Registro completo de medicamentos
   - Dosis, frecuencia, horarios personalizados
   - Instrucciones y efectos secundarios
   - Recordatorios activables
   - Fechas de inicio y fin
   
   #### Recomendaciones
   - Crear recomendaciones categorizadas (nutrición, ejercicio, terapia, estilo de vida, seguridad)
   - Niveles de prioridad (baja, media, alta)
   - Visible para el paciente
   
   #### Incidentes y Cambios
   - Registrar incidentes (caídas, emergencias, síntomas, reacciones medicamentos)
   - Niveles de severidad (baja, media, alta, crítica)
   - Acciones tomadas
   - Marcar como resueltos con notas de resolución
   
   #### Citas y Calendario
   - Programar citas médicas, terapias, revisiones
   - Ubicación y descripción
   - Recordatorios automáticos
   - Marcar como completadas o canceladas
   
   #### Indicadores de Salud
   - Registrar signos vitales (presión arterial, frecuencia cardíaca, temperatura, glucosa, peso, oxígeno)
   - Métricas personalizadas (estado de ánimo, sueño, dolor)
   - Marcar como anormal para alertas
   - Gráficas y tendencias
   
   #### Planes de Cuidado
   - Crear planes semanales/mensuales/trimestrales
   - Definir objetivos medibles
   - Seguimiento de progreso
   - Marcar objetivos como logrados

### Para Pacientes

1. **Panel Espejo Completo**
   - Vista general con resumen de todo
   - Acceso a todos los datos registrados por el cuidador
   - Solo lectura (no pueden modificar)

2. **Información Visible**
   - Cuidados diarios y su estado
   - Todos los medicamentos activos con instrucciones
   - Recomendaciones del cuidador
   - Próximas citas
   - Historial de incidentes
   - Indicadores de salud
   - Plan de cuidado con objetivos

## 📋 Plantillas de Cuidado

El sistema incluye 5 plantillas predefinidas:

### 1. Adulto Mayor
- Rutinas de higiene y alimentación
- Control de presión arterial
- Ejercicios de movilidad
- Actividades recreativas
- Hidratación constante

### 2. Niño
- Rutinas escolares
- Tiempo de juego supervisado
- Alimentación balanceada
- Tareas escolares
- Control de vacunación

### 3. Discapacidad
- Terapia física y ocupacional
- Ejercicios de autonomía
- Estimulación cognitiva
- Apoyo personalizado
- Adaptación del entorno

### 4. Post-Operatorio
- Control de signos vitales
- Limpieza de herida
- Medicación analgésica
- Movilización gradual
- Vigilancia de complicaciones

### 5. Temporal/Emergencia
- Evaluación inicial
- Asistencia básica
- Monitoreo constante
- Comunicación con familia
- Notas de seguimiento

## 🔗 API Endpoints

### Solicitudes de Servicio
```
POST   /api/service-requests          - Crear solicitud (paciente)
GET    /api/service-requests/caregiver - Listar solicitudes del cuidador
GET    /api/service-requests/patient   - Listar solicitudes del paciente
PATCH  /api/service-requests/:id/accept - Aceptar solicitud
PATCH  /api/service-requests/:id/reject - Rechazar solicitud
```

### Gestión de Pacientes (Cuidador)
```
GET    /api/patient-management/profiles           - Lista de pacientes
GET    /api/patient-management/profiles/:id       - Perfil específico
PATCH  /api/patient-management/profiles/:id       - Actualizar perfil

POST   /api/patient-management/daily-care         - Crear tarea
GET    /api/patient-management/daily-care         - Listar tareas
PATCH  /api/patient-management/daily-care/:id     - Actualizar tarea
PATCH  /api/patient-management/daily-care/:id/complete - Completar tarea
DELETE /api/patient-management/daily-care/:id     - Eliminar tarea

POST   /api/patient-management/medications        - Crear medicamento
GET    /api/patient-management/medications        - Listar medicamentos
PATCH  /api/patient-management/medications/:id    - Actualizar medicamento
DELETE /api/patient-management/medications/:id    - Eliminar medicamento

POST   /api/patient-management/recommendations    - Crear recomendación
GET    /api/patient-management/recommendations    - Listar recomendaciones
PATCH  /api/patient-management/recommendations/:id - Actualizar recomendación
DELETE /api/patient-management/recommendations/:id - Eliminar recomendación

POST   /api/patient-management/incidents          - Crear incidente
GET    /api/patient-management/incidents          - Listar incidentes
PATCH  /api/patient-management/incidents/:id      - Actualizar incidente
PATCH  /api/patient-management/incidents/:id/resolve - Resolver incidente

POST   /api/patient-management/appointments       - Crear cita
GET    /api/patient-management/appointments       - Listar citas
PATCH  /api/patient-management/appointments/:id   - Actualizar cita
DELETE /api/patient-management/appointments/:id   - Eliminar cita

POST   /api/patient-management/health-indicators  - Registrar indicador
GET    /api/patient-management/health-indicators  - Listar indicadores
PATCH  /api/patient-management/health-indicators/:id - Actualizar indicador

POST   /api/patient-management/care-plans         - Crear plan
GET    /api/patient-management/care-plans         - Listar planes
PATCH  /api/patient-management/care-plans/:id     - Actualizar plan
PATCH  /api/patient-management/care-plans/:planId/goals/:goalId/achieve - Marcar objetivo
```

### Vista del Paciente
```
GET    /api/my-care/dashboard          - Dashboard completo
GET    /api/my-care/daily-care         - Cuidados diarios
GET    /api/my-care/medications        - Medicamentos
GET    /api/my-care/recommendations    - Recomendaciones
GET    /api/my-care/incidents          - Incidentes
GET    /api/my-care/appointments       - Citas
GET    /api/my-care/health-indicators  - Indicadores de salud
GET    /api/my-care/care-plans         - Planes de cuidado
```

### Plantillas de Cuidado
```
GET    /api/care-templates             - Listar plantillas
GET    /api/care-templates/:id         - Obtener plantilla
POST   /api/care-templates             - Crear plantilla personalizada
PATCH  /api/care-templates/:id         - Actualizar plantilla
DELETE /api/care-templates/:id         - Eliminar plantilla
```

## 🚀 Instalación y Configuración

### Backend

1. Inicializar plantillas de cuidado:
```bash
cd Backend
node scripts/seedCareTemplates.js
```

2. Las rutas ya están registradas en `src/routes/index.js`

3. Los modelos están en `src/models/`

### Frontend

1. Los componentes están organizados en:
```
src/components/
  ├── caregiver/
  │   ├── ServiceRequests.jsx
  │   ├── PatientList.jsx
  │   ├── PatientDashboard.jsx
  │   └── sections/
  │       ├── DailyCareSection.jsx
  │       ├── MedicationsSection.jsx
  │       ├── RecommendationsSection.jsx
  │       ├── IncidentsSection.jsx
  │       ├── AppointmentsSection.jsx
  │       ├── HealthIndicatorsSection.jsx
  │       └── CarePlansSection.jsx
  └── patient/
      └── PatientCareView.jsx
```

2. Los servicios API están en:
```
src/api/patientManagement.js
```

## 🎨 Componentes del Frontend

### Para Cuidadores

#### `ServiceRequests`
Gestiona las solicitudes de servicio pendientes, aceptadas y rechazadas.

#### `PatientList`
Muestra todos los pacientes del cuidador con filtros.

#### `PatientDashboard`
Panel principal con tabs para cada sección:
- Información del paciente editable
- Pestañas para cada módulo
- Vista integrada de todo

#### Secciones Específicas
Cada sección tiene:
- Formularios dinámicos
- Listas interactivas
- Acciones inline (completar, editar, eliminar)
- Filtros y búsqueda

### Para Pacientes

#### `PatientCareView`
Panel espejo completo con:
- Vista general con estadísticas
- Todas las secciones de información
- Diseño amigable y fácil de entender
- Solo lectura

## 🔄 Flujo de Trabajo

### Flujo del Cuidador

1. **Recibir Solicitud**
   - Usuario solicita servicio
   - Aparece en "Solicitudes Pendientes"
   - Cuidador revisa y decide

2. **Aceptar Paciente**
   - Se crea perfil automáticamente
   - Se aplica plantilla según tipo
   - Aparece en "Mis Pacientes"

3. **Gestionar Paciente**
   - Acceder al dashboard del paciente
   - Registrar cuidados diarios
   - Administrar medicamentos
   - Crear recomendaciones
   - Registrar incidentes
   - Programar citas
   - Monitorear salud
   - Definir plan de cuidado

4. **Seguimiento Continuo**
   - Actualizar información diariamente
   - Completar tareas
   - Registrar cambios
   - Ajustar plan según progreso

### Flujo del Paciente

1. **Solicitar Servicio**
   - Buscar cuidador
   - Enviar solicitud
   - Esperar respuesta

2. **Acceder al Panel**
   - Una vez aceptado, ver todo en tiempo real
   - Dashboard con resumen
   - Tabs para cada sección
   - Información siempre actualizada

3. **Consultar Información**
   - Ver tareas del día
   - Revisar medicamentos
   - Leer recomendaciones
   - Ver próximas citas
   - Consultar historial
   - Seguir progreso del plan

## 📊 Modelos de Datos

### ServiceRequest
Solicitud de servicio del paciente al cuidador.

### PatientProfile
Perfil completo del paciente con información médica.

### CareTemplate
Plantillas predefinidas o personalizadas de cuidado.

### DailyCare
Tareas diarias de cuidado.

### Medication
Medicamentos con horarios y recordatorios.

### Recommendation
Recomendaciones del cuidador.

### Incident
Incidentes y cambios en el estado del paciente.

### Appointment
Citas médicas y terapias programadas.

### HealthIndicator
Signos vitales y métricas de salud.

### CarePlan
Planes de cuidado con objetivos medibles.

### Document
Archivos adjuntos (recetas, informes, fotos).

## 🔐 Seguridad

- Todos los endpoints requieren autenticación
- Los cuidadores solo pueden acceder a sus propios pacientes
- Los pacientes solo pueden ver su propia información
- Validación de permisos en cada operación

## 🎯 Próximos Pasos Recomendados

1. **Implementar Socket.IO** para notificaciones en tiempo real
2. **Sistema de archivos** para subir documentos médicos
3. **Recordatorios automáticos** para medicación y citas
4. **Gráficas** de indicadores de salud
5. **Exportar reportes** en PDF
6. **Notificaciones push** para móvil
7. **Chat integrado** entre cuidador y paciente
8. **Videoconferencias** para consultas remotas

## 📱 Rutas del Frontend (sugeridas)

```javascript
// Para agregar en routes.jsx

// Cuidador
/caregiver/requests              → ServiceRequests
/caregiver/patients              → PatientList
/caregiver/patients/:id          → PatientDashboard

// Paciente
/patient/my-care                 → PatientCareView
```

## 💡 Tips de Uso

- **Plantillas**: Usa las plantillas del sistema como punto de partida
- **Personalización**: Puedes crear plantillas personalizadas
- **Categorías**: Organiza tareas y recomendaciones por categoría
- **Prioridades**: Marca lo importante con prioridad alta
- **Incidentes**: Registra cualquier cambio significativo
- **Indicadores**: Monitorea tendencias en la salud
- **Objetivos**: Define metas claras y medibles

## 🐛 Solución de Problemas

**Error al crear paciente**: Verifica que las plantillas estén inicializadas
**No aparecen datos**: Revisa que el usuario esté autenticado correctamente
**Permisos denegados**: Asegúrate de que el rol sea el correcto (caregiver/user)

## 📞 Soporte

Para dudas o problemas, consulta la documentación técnica o contacta al equipo de desarrollo.
