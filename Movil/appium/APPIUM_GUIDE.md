# WiiCare Mobile - Guía de Testing Automatizado con Appium

## 🎯 Resumen Ejecutivo

Este documento describe cómo ejecutar los tests automatizados del proyecto WiiCare Mobile usando Appium para pruebas de automatización móvil.

## 📋 Prerequisitos

### Software Requerido
- ✅ **Node.js 20.17.0** (instalado)
- ✅ **Appium 2.11.5** (instalado)
- ✅ **UiAutomator2 Driver 4.2.9** (instalado)
- ✅ **Flutter 3.33.0** (instalado)
- ✅ **Android SDK 35** (instalado)
- ✅ **ADB** (Android Debug Bridge)

### Dispositivo
- Dispositivo Android físico con USB Debugging activado, o
- Emulador Android (API 28+)

### Verificación de Instalación

```powershell
# Verificar Node.js
node --version  # Debe mostrar v20.17.0

# Verificar Appium
appium --version  # Debe mostrar 2.11.5

# Verificar driver
appium driver list --installed  # Debe listar uiautomator2@4.2.9

# Verificar Flutter
flutter --version

# Verificar dispositivos conectados
adb devices
```

## 🚀 Ejecución Rápida

### Opción 1: Scripts Automatizados (Recomendado)

#### Terminal 1 - Servidor Appium
```powershell
cd Movil\appium
.\start-appium.ps1
```

#### Terminal 2 - Tests
```powershell
cd Movil\appium
.\run-tests.ps1
```

### Opción 2: Ejecución Manual

#### Terminal 1 - Servidor Appium
```powershell
appium
```

#### Terminal 2 - Construir APK
```powershell
cd Movil
flutter build apk --debug
```

#### Terminal 3 - Ejecutar Tests
```powershell
cd Movil\appium
npm test
```

## 📱 Suites de Tests Disponibles

### Ejecutar Suite Específica

```powershell
# Login tests
.\run-tests.ps1 -Suite login

# Services tests
.\run-tests.ps1 -Suite services

# User Story 1 (Login)
.\run-tests.ps1 -Suite us1

# User Story 2 (Services)
.\run-tests.ps1 -Suite us2

# User Story 3 (Chat)
.\run-tests.ps1 -Suite us3

# Todos los tests
.\run-tests.ps1 -Suite all
```

### Manualmente con WebDriverIO

```powershell
# Un spec específico
npx wdio run wdio.conf.js --spec test/specs/login.spec.js

# Todos los specs
npm test
```

## 🧪 Tests Implementados

### 1. Login Tests (`test/specs/login.spec.js`)
- ✅ Validación de campos vacíos
- ✅ Formato de email inválido
- ✅ Login con credenciales correctas
- ✅ Login con credenciales incorrectas

### 2. Services Tests (`test/specs/services.spec.js`)
- ✅ Navegación a servicios
- ✅ Visualización de servicios disponibles
- ✅ Filtrado por categoría

### 3. User Story 1 (`test/specs/US1-login-test.spec.js`)
**Como** usuario nuevo
**Quiero** registrarme en la aplicación
**Para** acceder a los servicios de salud

- ✅ Navegación a registro
- ✅ Completar formulario de registro
- ✅ Crear cuenta exitosamente

### 4. User Story 2 (`test/specs/US2-services-test.spec.js`)
**Como** usuario registrado
**Quiero** ver servicios disponibles
**Para** solicitar atención médica

- ✅ Login
- ✅ Ver lista de servicios
- ✅ Ver detalles de servicio

### 5. User Story 3 (`test/specs/US3-chat-test.spec.js`)
**Como** usuario
**Quiero** chatear con profesionales de salud
**Para** recibir asistencia

- ✅ Login
- ✅ Navegar a chat
- ✅ Ver conversaciones

## 🔧 Configuración

### `wdio.conf.js`

Configuración principal de WebDriverIO:

```javascript
{
  port: 4723,
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android',
    'appium:app': '../build/app/outputs/flutter-apk/app-debug.apk',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 300
  }],
  framework: 'mocha',
  mochaOpts: {
    timeout: 60000
  }
}
```

### Variables de Entorno

El archivo `.env` (si existe) puede contener:

```env
APPIUM_PORT=4723
DEVICE_NAME=Android
PLATFORM_VERSION=15
```

## 🐛 Troubleshooting

### Error: "Unable to connect to http://127.0.0.1:4723/"

**Causa**: Servidor Appium no está corriendo

**Solución**:
```powershell
# Terminal separada
.\start-appium.ps1
```

### Error: "APK not found"

**Causa**: No se ha construido el APK de debug

**Solución**:
```powershell
cd Movil
flutter build apk --debug
```

### Error: "No devices connected"

**Causa**: No hay dispositivos Android detectados

**Solución**:
```powershell
# Verificar dispositivos
adb devices

# Si no aparece nada:
# 1. Activar USB Debugging en el dispositivo
# 2. Conectar vía USB
# 3. Aceptar el diálogo de autorización
```

### Error: "Driver incompatibility"

**Causa**: Versión de Appium incompatible con driver

**Solución**:
```powershell
# Reinstalar Appium 2.11.5
npm uninstall -g appium
npm install -g appium@2.11.5

# Reinstalar driver desde temp (evita OneDrive)
cd $env:TEMP
appium driver install uiautomator2
```

### Error: "Session creation failed"

**Causas posibles**:
1. APK corrupto
2. Dispositivo bloqueado
3. Permisos insuficientes

**Solución**:
```powershell
# Limpiar y reconstruir
flutter clean
flutter pub get
flutter build apk --debug

# Desinstalar app del dispositivo
adb uninstall com.example.movil

# Desbloquear dispositivo
# Ejecutar test nuevamente
```

### OneDrive File Locking

**Error**: `EPERM` o `ENOTEMPTY` durante instalación de driver

**Solución**:
```powershell
# Instalar desde carpeta temporal
cd $env:TEMP
appium driver install uiautomator2
cd -
```

## 📊 Interpretación de Resultados

### Salida Exitosa
```
✓ should display login screen
✓ should show validation errors for empty fields
✓ should login successfully with valid credentials

3 passing (45s)
```

### Salida con Errores
```
✓ should display login screen
✗ should login successfully with valid credentials
  Error: Element not found: ~loginButton

1 passing (30s)
1 failing
```

## 🔄 Integración Continua

Los tests de Appium están configurados en GitHub Actions (`.github/workflows/flutter-tests.yml`):

```yaml
- name: Run Appium Tests
  run: |
    appium &
    cd Movil/appium
    npm test
```

## 📝 Notas de Versiones

### Compatibilidad
- **Appium 2.11.5**: Compatible con Node.js 20.17.0
- **Appium 3.x**: Requiere Node.js 20.19+ (no soportado actualmente)
- **UiAutomator2 4.2.9**: Compatible con Appium 2.11.5

### Limitaciones Conocidas
1. Appium 3.x no es compatible con Node.js 20.17.0
2. OneDrive puede causar problemas con archivos APK durante instalación
3. Tests de video call requieren configuración de Agora App ID

## 🎯 Próximos Pasos

- [ ] Configurar Agora App ID para tests de videollamadas
- [ ] Agregar tests de perfil de usuario
- [ ] Implementar tests de notificaciones
- [ ] Agregar captura de screenshots en fallos
- [ ] Configurar reporte HTML de tests

## 📚 Referencias

- [Appium Documentation](https://appium.io/docs/en/latest/)
- [WebDriverIO Documentation](https://webdriver.io/)
- [Flutter Integration Testing](https://docs.flutter.dev/cookbook/testing/integration/introduction)
- [Android Debug Bridge (ADB)](https://developer.android.com/studio/command-line/adb)

---

**Última actualización**: Configuración estable con Appium 2.11.5 + UiAutomator2 4.2.9
