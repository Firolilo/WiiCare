# Reporte de Pruebas - WiiCare Mobile App

**Fecha:** [DD/MM/YYYY]  
**Versión de la App:** [X.Y.Z]  
**Plataforma:** Android / iOS  
**Ejecutado por:** [Nombre del QA]

---

## 1. Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Total de Pruebas Ejecutadas** | X |
| **Pruebas Exitosas** | X |
| **Pruebas Fallidas** | X |
| **Tasa de Éxito** | XX% |
| **Duración Total** | XX minutos |

### Estado General
- [ ] ✅ Todos los casos de prueba pasaron
- [ ] ⚠️ Algunas pruebas fallaron (ver detalles)
- [ ] ❌ Fallos críticos encontrados

---

## 2. Historias de Usuario Probadas

### Historia de Usuario 1: Registro de Cuidador y Publicación de Servicio

**Descripción:** Como cuidador, quiero registrarme en la plataforma y publicar un servicio para que los usuarios puedan encontrar y contratar mis servicios.

**Criterios de Aceptación:**
1. El cuidador puede completar el formulario de registro
2. El sistema valida los campos requeridos
3. El cuidador puede seleccionar su rol
4. Después del registro, puede acceder a la sección de servicios

**Resultado:** [ ] ✅ Aprobado | [ ] ❌ Fallido

**Evidencias:**

<details>
<summary>Capturas de Pantalla</summary>

- Formulario de registro: `screenshots/us1-registration-form.png`
- Selección de rol: `screenshots/us1-role-selection.png`
- Confirmación de registro: `screenshots/us1-registration-success.png`
- Pantalla de servicios: `screenshots/us1-services-screen.png`

</details>

<details>
<summary>Logs de Ejecución</summary>

```
[Timestamp] - Iniciando prueba US1
[Timestamp] - Navegando a pantalla de registro
[Timestamp] - Llenando formulario con datos de prueba
[Timestamp] - Seleccionando rol: caregiver
[Timestamp] - Enviando formulario
[Timestamp] - ✅ Registro exitoso
[Timestamp] - Navegando a servicios
[Timestamp] - ✅ Pantalla de servicios cargada
```

</details>

**Observaciones:**
- [Agregar cualquier observación relevante]

---

### Historia de Usuario 2: Búsqueda de Cuidadores por Ubicación/Tipo

**Descripción:** Como usuario, quiero buscar cuidadores por ubicación y tipo de servicio para encontrar el cuidador más adecuado para mis necesidades.

**Criterios de Aceptación:**
1. El usuario puede registrarse con rol de "usuario"
2. Puede acceder a la pantalla de búsqueda de servicios
3. Puede filtrar por ubicación
4. Se muestran resultados relevantes

**Resultado:** [ ] ✅ Aprobado | [ ] ❌ Fallido

**Evidencias:**

<details>
<summary>Capturas de Pantalla</summary>

- Registro de usuario: `screenshots/us2-user-registration-form.png`
- Pantalla de búsqueda: `screenshots/us2-search-screen.png`
- Filtros aplicados: `screenshots/us2-filters-applied.png`
- Resultados de búsqueda: `screenshots/us2-search-results.png`

</details>

<details>
<summary>Logs de Ejecución</summary>

```
[Timestamp] - Iniciando prueba US2
[Timestamp] - Registrando usuario de prueba
[Timestamp] - Navegando a búsqueda de servicios
[Timestamp] - Aplicando filtro de ubicación: San José
[Timestamp] - ✅ Resultados mostrados correctamente
```

</details>

**Observaciones:**
- [Agregar cualquier observación relevante]

---

### Historia de Usuario 3: Login de Usuario y Acceso al Chat

**Descripción:** Como usuario registrado, quiero iniciar sesión y acceder al chat para comunicarme con los cuidadores.

**Criterios de Aceptación:**
1. El usuario puede iniciar sesión con credenciales válidas
2. El sistema muestra error con credenciales inválidas
3. Después de login, puede navegar al chat
4. El chat se muestra correctamente

**Resultado:** [ ] ✅ Aprobado | [ ] ❌ Fallido

**Evidencias:**

<details>
<summary>Capturas de Pantalla</summary>

- Pantalla de login: `screenshots/us3-login-form.png`
- Login exitoso: `screenshots/us3-login-success.png`
- Pantalla de chat: `screenshots/us3-chat-screen.png`
- Lista de conversaciones: `screenshots/us3-conversations-list.png`

</details>

<details>
<summary>Logs de Ejecución</summary>

```
[Timestamp] - Iniciando prueba US3
[Timestamp] - Ingresando credenciales
[Timestamp] - ✅ Login exitoso
[Timestamp] - Navegando a chat
[Timestamp] - ✅ Chat cargado correctamente
```

</details>

**Observaciones:**
- [Agregar cualquier observación relevante]

---

## 3. Pruebas Automatizadas

### 3.1 Flutter Driver Tests

**Comando ejecutado:**
```bash
flutter drive --target=test_driver/app.dart
```

**Resultados:**
```
Test Results:
✅ US1: Caregiver registration and service posting - PASSED
✅ US2: Search caregivers by location and type - PASSED
✅ US3: User login and chat access - PASSED
✅ Navigation between all tabs - PASSED
✅ Screen loading performance - PASSED

Total: 5 tests, 5 passed, 0 failed
Duration: 2m 34s
```

### 3.2 Integration Tests

**Comando ejecutado:**
```bash
flutter test integration_test/app_test.dart
```

**Resultados:**
```
[Agregar resultados de integration tests]
```

### 3.3 Appium Tests

**Comando ejecutado:**
```bash
cd appium
npm test
```

**Resultados:**
```
[Agregar resultados de Appium tests]
```

---

## 4. Pruebas de Rendimiento

### Tiempos de Carga de Pantallas

| Pantalla | Tiempo de Carga | Estado |
|----------|----------------|--------|
| Splash Screen | XXms | ✅ |
| Login | XXms | ✅ |
| Registro | XXms | ✅ |
| Home | XXms | ✅ |
| Servicios | XXms | ✅ |
| Chat | XXms | ✅ |
| Perfil | XXms | ✅ |

**Criterio de Aceptación:** < 1000ms por pantalla

---

## 5. Pruebas de Conectividad con Backend

### Endpoints Probados

| Endpoint | Método | Estado | Tiempo de Respuesta |
|----------|--------|--------|---------------------|
| `/api/auth/register` | POST | ✅ | XXms |
| `/api/auth/login` | POST | ✅ | XXms |
| `/api/auth/me` | GET | ✅ | XXms |
| `/api/services` | GET | ✅ | XXms |
| `/api/services` | POST | ✅ | XXms |

**Backend URL:** `http://10.0.2.2:4000` (Android Emulator)

**Observaciones:**
- [Agregar observaciones sobre la conectividad]

---

## 6. Bugs Encontrados

### Bug #1: [Título del Bug]

**Severidad:** 🔴 Crítico | 🟡 Medio | 🟢 Bajo

**Descripción:**
[Descripción detallada del bug]

**Pasos para Reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado Esperado:**
[Qué debería pasar]

**Resultado Actual:**
[Qué está pasando]

**Evidencias:**
- Screenshot: `screenshots/bug1-evidence.png`
- Logs: `logs/bug1-error.log`

**Estado:** [ ] Abierto | [ ] En Progreso | [ ] Resuelto

---

### Bug #2: [Título del Bug]

[Seguir la misma estructura]

---

## 7. Pruebas de Validación de Formularios

### Formulario de Registro

| Campo | Validación Probada | Resultado |
|-------|-------------------|-----------|
| Nombre | Campo requerido | ✅ |
| Nombre | Longitud mínima | ✅ |
| Email | Campo requerido | ✅ |
| Email | Formato válido | ✅ |
| Contraseña | Campo requerido | ✅ |
| Contraseña | Longitud mínima (6 caracteres) | ✅ |
| Confirmar Contraseña | Debe coincidir | ✅ |
| Rol | Selección requerida | ✅ |

### Formulario de Login

| Campo | Validación Probada | Resultado |
|-------|-------------------|-----------|
| Email | Campo requerido | ✅ |
| Email | Formato válido | ✅ |
| Contraseña | Campo requerido | ✅ |

---

## 8. Pruebas de Navegación

### Flujo de Navegación Principal

```
Splash Screen → Login → MainNavigation
                  ↓
              Registro → MainNavigation
```

### Navegación entre Tabs

| Origen | Destino | Resultado |
|--------|---------|-----------|
| Home | Servicios | ✅ |
| Servicios | Chat | ✅ |
| Chat | Perfil | ✅ |
| Perfil | Home | ✅ |

---

## 9. Configuración del Entorno de Pruebas

### Dispositivo/Emulador

- **Dispositivo:** [Nombre del dispositivo o emulador]
- **OS:** Android X.X / iOS X.X
- **Resolución:** XXXXxXXXX
- **RAM:** XGB

### Software

- **Flutter:** 3.16.0
- **Dart:** 3.2.0
- **Appium:** 2.4.1
- **Node.js:** 18.x

### Backend

- **URL:** http://10.0.2.2:4000
- **Estado:** ✅ Operativo | ❌ No disponible
- **Versión:** X.Y.Z

---

## 10. Recomendaciones

### Mejoras Sugeridas

1. [Recomendación 1]
2. [Recomendación 2]
3. [Recomendación 3]

### Próximos Pasos

- [ ] Resolver bugs críticos
- [ ] Implementar pruebas adicionales
- [ ] Optimizar tiempos de carga
- [ ] Mejorar manejo de errores

---

## 11. Conclusiones

[Resumen general de los resultados de las pruebas, estado de la aplicación, y recomendaciones finales]

---

## 12. Anexos

### Screenshots

Todas las capturas de pantalla están disponibles en: `Movil/screenshots/`

### Logs Completos

Los logs completos están disponibles en: `Movil/test-results/logs/`

### Videos de Ejecución

[Si hay videos de las pruebas, listarlos aquí]

---

**Firma del QA:** ___________________  
**Fecha:** ___________________
