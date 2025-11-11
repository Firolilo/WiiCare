# WiiCare Móvil - Flutter

Aplicación móvil de WiiCare para Android e iOS. Permite que usuarios y cuidadores se registren, publiquen servicios, busquen cuidadores y se comuniquen mediante chat.

## 📋 Requisitos Previos

- **Flutter SDK**: 3.0.0 o superior ([Instalación](https://docs.flutter.dev/get-started/install))
- **Dart**: 3.0.0 o superior (incluido con Flutter)
- **Android Studio** o **Xcode** (según la plataforma objetivo)
- **Dispositivo/Emulador**: Android 5.0+ o iOS 12+
- **Backend WiiCare** corriendo en `http://localhost:4000` (ver `/Backend`)

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

### 3. Configurar Variables de Entorno

Copia `.env.example` a `.env` y ajusta la URL de tu API:

```bash
cp .env.example .env
```

Edita `.env`:

```env
# Para Android Emulator:
API_BASE_URL=http://10.0.2.2:4000/api

# Para dispositivo físico (reemplaza con tu IP local):
# API_BASE_URL=http://192.168.1.XXX:4000/api
```

**Nota**: `10.0.2.2` es la IP del host desde el emulador de Android. Para iOS Simulator usa `localhost` o tu IP local.

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

1. Inicia Appium:

```bash
appium
```

2. Compila la app en modo debug:

```bash
flutter build apk --debug  # Android
```

3. Ejecuta las pruebas (desde `appium/`):

```bash
cd appium
npm install
npm test
```

#### Scripts Appium Disponibles

- `npm test` - Ejecuta todas las pruebas
- `npm run test:login` - Prueba de login
- `npm run test:register` - Prueba de registro
- `npm run test:services` - Prueba de búsqueda de servicios

## 📊 Reporte de Pruebas QA

Los reportes de pruebas se generan en:

- **Flutter Test**: `coverage/lcov.info`
- **Integration Test**: Logs en consola
- **Appium**: `appium/reports/test_report.json`

Ver [`test_report.md`](./test_report.md) para evidencias y capturas.

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Hot reload automático
flutter run

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
- **iOS Simulator**: Usa `http://localhost:4000/api`
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
