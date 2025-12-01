# Integración de Gestión de Servicios - WiiCare Flutter

## Resumen de Cambios

Se ha implementado un sistema completo de gestión de servicios para la aplicación móvil Flutter, con funcionalidades diferenciadas según el rol del usuario.

## Archivos Creados

### 1. **lib/services/service_api_service.dart**
- Servicio para operaciones CRUD de servicios
- Métodos:
  - `listServices()` - Listar servicios con filtros opcionales
  - `getService(id)` - Obtener servicio por ID
  - `createService()` - Crear servicio (solo caregivers)
  - `updateService(id)` - Actualizar servicio (solo caregivers)
  - `deleteService(id)` - Eliminar servicio (solo caregivers)

### 2. **lib/providers/service_provider.dart**
- Provider para gestionar estado global de servicios
- Estados:
  - `services` - Todos los servicios (para usuarios)
  - `myServices` - Servicios del caregiver actual
  - `isLoading` - Indicador de carga
  - `error` - Mensaje de error
- Métodos:
  - `loadAllServices()` - Cargar todos los servicios
  - `loadMyServices(caregiverId)` - Cargar servicios del caregiver
  - `createService()` - Crear nuevo servicio
  - `updateService()` - Actualizar servicio existente
  - `deleteService()` - Eliminar servicio

### 3. **lib/screens/my_services_screen.dart**
- Pantalla para que **caregivers** gestionen sus servicios
- Funcionalidades:
  - Lista de servicios propios
  - Botón para crear nuevo servicio
  - Editar servicio existente
  - Eliminar servicio con confirmación
  - Pull-to-refresh
  - Visualización de: título, descripción, tarifa, ubicación, tags

### 4. **lib/screens/service_form_screen.dart**
- Formulario para crear/editar servicios
- Campos:
  - Título (requerido)
  - Descripción (requerido)
  - Tarifa por hora (requerido)
  - Ubicación (opcional)
  - Disponibilidad (opcional)
  - Tags/Etiquetas (múltiples)
- Validación de formulario
- Manejo de estado de carga

### 5. **lib/screens/browse_services_screen.dart**
- Pantalla para que **usuarios** vean todos los servicios disponibles
- Funcionalidades:
  - Barra de búsqueda
  - Lista de todos los servicios
  - Filtrado por texto
  - Pull-to-refresh
  - Tarjetas con información resumida
  - Modal con detalles completos del servicio
  - Botón de contacto (placeholder)

## Archivos Modificados

### 1. **lib/main.dart**
- Agregado `ServiceProvider` al MultiProvider
```dart
ChangeNotifierProvider(create: (_) => ServiceProvider())
```

### 2. **lib/screens/services_screen.dart**
- Modificado para mostrar pantalla según rol:
  - **Caregiver** → `MyServicesScreen` (gestionar servicios)
  - **Usuario** → `BrowseServicesScreen` (explorar servicios)

### 3. **lib/services/api_service.dart**
- Método `get()` actualizado para soportar query parameters:
```dart
Future<Map<String, dynamic>> get(
  String endpoint, {
  Map<String, String>? queryParams,
})
```

## Flujo de Uso

### Para Caregivers:
1. Iniciar sesión como caregiver
2. Navegar a pestaña "Servicios"
3. Ver lista de servicios propios (inicialmente vacía)
4. Tap en botón "Nuevo Servicio" (FAB)
5. Llenar formulario con datos del servicio
6. Guardar servicio
7. Servicio aparece en la lista
8. Opciones: Editar o Eliminar cada servicio

### Para Usuarios:
1. Iniciar sesión como usuario
2. Navegar a pestaña "Servicios"
3. Ver todos los servicios disponibles
4. Usar barra de búsqueda para filtrar
5. Tap en servicio para ver detalles completos
6. Modal con información completa
7. Botón "Contactar" (funcionalidad futura)

## API Endpoints Utilizados

- `GET /services` - Listar servicios
  - Query params: `query`, `tag`, `location`, `caregiver`
- `GET /services/:id` - Obtener servicio por ID
- `POST /services` - Crear servicio (auth + caregiver)
- `PUT /services/:id` - Actualizar servicio (auth + caregiver)
- `DELETE /services/:id` - Eliminar servicio (auth + caregiver)

## Características Implementadas

✅ Diferenciación de contenido por rol de usuario
✅ Formulario completo de creación/edición
✅ Validación de campos
✅ Búsqueda y filtrado
✅ Pull-to-refresh
✅ Manejo de estados de carga y error
✅ Confirmación antes de eliminar
✅ Diseño responsive con Material Design
✅ Tags/etiquetas para categorización
✅ Modal de detalles con diseño atractivo

## Próximos Pasos Sugeridos

1. **Sistema de Contacto**: Integrar con el chat existente para contactar caregivers
2. **Reservas/Booking**: Sistema para agendar servicios
3. **Calificaciones**: Sistema de reviews y ratings
4. **Favoritos**: Guardar servicios favoritos
5. **Filtros Avanzados**: Más opciones de filtrado (precio, ubicación, rating)
6. **Imágenes**: Soporte para fotos de perfil del caregiver
7. **Notificaciones**: Alertas cuando hay nuevos servicios

## Testing

Para probar la funcionalidad:

1. **Como Caregiver**:
   - Login con email: `persona@gmail.com` (rol: caregiver)
   - Crear al menos un servicio
   - Editar servicio creado
   - Eliminar servicio

2. **Como Usuario**:
   - Login con email: `ppersona@gmail.com` (rol: user)
   - Ver servicios disponibles
   - Buscar servicios
   - Ver detalles de un servicio

## Notas Técnicas

- El modelo `Service` ya existía en el proyecto
- Se respeta la estructura de datos del backend
- Manejo robusto de errores con try-catch
- Logs con emojis para debugging
- Código limpio y comentado
- Uso de Provider para state management consistente
