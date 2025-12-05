# WiiCare Móvil - Flutter

Aplicación móvil de WiiCare para Android e iOS. Permite que usuarios y cuidadores se registren, publiquen servicios, busquen cuidadores, se comuniquen mediante chat y realicen videollamadas.

## ✨ Características

- � **Autenticación** - Login/Registro con JWT
- 👤 **Perfiles** - Usuarios y Cuidadores
- 🔍 **Búsqueda** - Encuentra servicios de cuidado
- 💬 **Chat** - Mensajería en tiempo real
- 📹 **Videollamadas** - Comunicación por video (Agora.io)
- 🧪 **Testing Completo** - Unit, Widget, Integration y E2E tests

## �📋 Requisitos Previos

- **Flutter SDK**: 3.0.0 o superior ([Instalación](https://docs.flutter.dev/get-started/install))
- **Dart**: 3.0.0 o superior (incluido con Flutter)
- **Android Studio** o **Xcode** (según la plataforma objetivo)
- **Dispositivo/Emulador**: Android 5.0+ o iOS 12+
- **Backend WiiCare** corriendo en `http://44.211.88.225` (ver `/Backend`)
- **Cuenta Agora.io** (para videollamadas) - [Crear cuenta gratis](https://www.agora.io/)

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

Desde la carpeta `Movil/`:

```bash
flutter pub get
```

### 2. Generar Código JSON Serializable

Los modelos usan `json_serializable`. Genera los archivos `.g.dart`:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 3. Configurar URL del Backend

Edita `lib/utils/constants.dart` y ajusta la IP según tu caso:

```dart
static const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://192.168.0.27:4000/api', // Tu IP local
);
```

**Opciones:**
- Android Emulator: `http://10.0.2.2:4000/api`
- Dispositivo físico: `http://TU_IP_LOCAL:4000/api` (ej: `http://192.168.0.27:4000/api`)
- iOS Simulator: `http://44.211.88.225/api`

### 4. Configurar Videollamadas (Opcional)

Ver guía completa en: **[VIDEO_CALLS_SETUP.md](./VIDEO_CALLS_SETUP.md)**

1. Crea cuenta en [Agora.io](https://www.agora.io/)
2. Obtén tu App ID
3. Edita `lib/services/video_call_service.dart`:
   ```dart
   static const String appId = 'TU_AGORA_APP_ID';
   ```


### 4. Ejecutar la Aplicación

#### Android

```bash
flutter run
```

#### iOS (solo macOS)

```bash
flutter run -d ios
```

#### Modo Release

```bash
flutter run --release
```

## 📁 Estructura del Proyecto

```
Movil/
├── lib/
│   ├── main.dart                 # Punto de entrada de la app
│   ├── models/                   # Modelos de datos (User, Service, etc.)
│   │   ├── user.dart
│   │   ├── service.dart
│   │   ├── conversation.dart
│   │   └── message.dart
│   ├── services/                 # Servicios de API
│   │   ├── api_service.dart      # Cliente HTTP base
│   │   ├── auth_service.dart     # Autenticación (login/registro)
│   │   └── service_service.dart  # Gestión de servicios
│   ├── providers/                # Gestión de estado (Provider)
│   │   └── auth_provider.dart
│   ├── screens/                  # Pantallas de la app
│   │   ├── splash_screen.dart
│   │   ├── login_screen.dart
│   │   ├── register_screen.dart
│   │   ├── main_navigation.dart
│   │   ├── home_screen.dart
│   │   ├── services_screen.dart
│   │   ├── chat_screen.dart
│   │   └── profile_screen.dart
│   ├── widgets/                  # Componentes reutilizables
│   └── utils/                    # Constantes y utilidades
│       └── constants.dart
├── test/                         # Pruebas unitarias
├── integration_test/             # Pruebas de integración
├── test_driver/                  # Pruebas con Flutter Driver
├── appium/                       # Configuración de Appium
├── pubspec.yaml                  # Dependencias
└── README.md                     # Esta documentación
```

## 🎯 Funcionalidades Principales

### Historias de Usuario Implementadas

1. **Como cuidador, quiero crear mi perfil y ofrecer servicios desde el celular**
   - Registro con rol "caregiver"
   - Creación y edición de servicios
   - Gestión de perfil profesional

2. **Como usuario, quiero buscar cuidadores por ubicación o tipo de cuidado**
   - Listado de servicios disponibles
   - Filtros por ubicación, tags y búsqueda de texto
   - Vista de detalle de servicio

3. **Como usuario, quiero iniciar sesión y acceder a mis chats**
   - Login/logout con JWT
   - Listado de conversaciones
   - Envío y recepción de mensajes

### Navegación

La app usa `BottomNavigationBar` con 4 secciones:

- **Home**: Bienvenida y acceso rápido
- **Servicios**: Búsqueda y listado de cuidadores
- **Chat**: Conversaciones activas
- **Perfil**: Datos del usuario y configuración

## 🧪 Pruebas Automatizadas

### Pruebas Unitarias y de Widget

```bash
flutter test
```

### Pruebas de Integración (Integration Test)

```bash
flutter test integration_test/
```

### Pruebas con Flutter Driver

1. Iniciar el driver:

```bash
flutter drive --target=test_driver/app.dart
```

2. Ejecutar casos de prueba específicos:

```bash
flutter drive \
  --target=test_driver/app.dart \
  --driver=test_driver/user_stories/user_registration_test.dart
```

### Pruebas con Appium

#### Prerequisitos

- **Appium Server**: 2.0 o superior
- **Node.js**: 18+

#### Instalación de Appium

```bash
npm install -g appium
appium driver install uiautomator2  # Para Android
appium driver install xcuitest      # Para iOS
```

#### Ejecutar Pruebas Appium
## 🧪 Testing

La app incluye **4 niveles de pruebas** para garantizar calidad. Ver guía completa: **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**

### 🚀 Quick Start - Ejecutar Todas las Pruebas

```bash
# 1. Unit tests y Widget tests (rápido, sin dispositivo)
flutter test

# 2. Integration tests (requiere dispositivo/emulador)
flutter test integration_test/app_test.dart

# 3. Flutter Driver E2E tests
flutter drive --target=test_driver/app.dart --driver=test_driver/app_test.dart

# 4. Appium tests (requiere servidor Appium corriendo)
cd appium
npm install
appium &  # Terminal 1
npm test  # Terminal 2
```

### 📋 Tests Implementados

✅ **Unit Tests** (`test/`)
- Lógica de negocio
- Servicios API
- Modelos de datos

✅ **Integration Tests** (`integration_test/`)
- US1: Registro de cuidador completo
- US2: Búsqueda y filtrado de servicios
- US3: Login y envío de mensajes
- Validaciones de formularios

✅ **Flutter Driver Tests** (`test_driver/`)
- Flujos completos de usuario
- Tests de performance
- Navegación entre pantallas

✅ **Appium Tests** (`appium/`)
- Automatización avanzada
- Screenshots automáticos
- Reportes HTML

### 📊 Ver Cobertura de Código

```bash
# Generar reporte de cobertura
flutter test --coverage

# Convertir a HTML (requiere lcov)
genhtml coverage/lcov.info -o coverage/html

# Abrir en navegador
start coverage/html/index.html  # Windows
open coverage/html/index.html   # macOS
```

---

## 📊 Reporte de Pruebas QA

Los reportes de pruebas se generan en:

- **Flutter Test**: `coverage/lcov.info`
- **Integration Test**: Logs en consola
- **Appium**: `appium/screenshots/` y reportes HTML

Ver [`test_report.md`](./test_report.md) para evidencias y capturas de pantalla.

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Hot reload automático
flutter run

# Hot reload con logs verbosos
flutter run -v

# Limpiar build cache
flutter clean

# Analizar código
flutter analyze

# Formatear código
flutter format lib/

# Ver dispositivos conectados
flutter devices
```

### Build

```bash
# Android APK (debug)
flutter build apk

# Android APK (release)
flutter build apk --release

# Android App Bundle (Google Play)
flutter build appbundle --release

# iOS (solo macOS)
flutter build ios --release
```

## 🐛 Troubleshooting

### Error: "Target of URI doesn't exist"

Ejecuta `flutter pub get` para instalar las dependencias.

### Error: "Missing part"

Genera los archivos de código con:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### No se conecta al backend

- **Android Emulator**: Usa `http://10.0.2.2:4000/api`
- **iOS Simulator**: Usa `http://44.211.88.225/api`
- **Dispositivo físico**: Usa tu IP local (ej. `http://192.168.1.10:4000/api`)

Verifica que el backend esté corriendo:

```bash
cd ../Backend
npm run dev
```

### Appium no encuentra la app

Asegúrate de haber compilado la APK:

```bash
flutter build apk --debug
```

La ruta por defecto es: `build/app/outputs/flutter-apk/app-debug.apk`

## 📚 Documentación Adicional

- [Flutter Docs](https://docs.flutter.dev/)
- [Provider Package](https://pub.dev/packages/provider)
- [Flutter Driver](https://docs.flutter.dev/cookbook/testing/integration/introduction)
- [Appium Docs](https://appium.io/docs/en/latest/)

## 🚢 CI/CD con GitHub Actions

El workflow `.github/workflows/mobile-ci.yml` ejecuta automáticamente:

1. Instalación de dependencias
2. Análisis de código (`flutter analyze`)
3. Pruebas unitarias (`flutter test`)
4. Pruebas de integración
5. Build de APK

Ver el archivo de configuración en la raíz del monorepo.

## 📝 Licencia

MIT - Ver LICENSE en la raíz del repositorio.

---

**Mantenedores**: Equipo WiiCare  
**Última actualización**: Noviembre 2025
