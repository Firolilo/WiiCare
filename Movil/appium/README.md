# Appium Tests for WiiCare Mobile App

Este directorio contiene las pruebas automatizadas de Appium para la aplicación móvil de WiiCare.

## 📋 Requisitos Previos

### Software Necesario

1. **Node.js** (v16 o superior)
   ```bash
   node --version
   ```

2. **Appium** (v2.x)
   ```bash
   npm install -g appium
   appium --version
   ```

3. **Appium Doctor** (para verificar configuración)
   ```bash
   npm install -g appium-doctor
   ```

4. **Android Studio** (para pruebas en Android)
   - Android SDK
   - Android Emulator
   - Platform Tools

5. **Xcode** (para pruebas en iOS, solo macOS)
   - Xcode Command Line Tools
   - iOS Simulator

## 🚀 Instalación

1. Navegar al directorio de Appium:
   ```bash
   cd Movil/appium
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Instalar drivers de Appium:
   ```bash
   # Para Android
   appium driver install uiautomator2

   # Para iOS
   appium driver install xcuitest
   ```

4. Verificar instalación con Appium Doctor:
   ```bash
   # Para Android
   appium-doctor --android

   # Para iOS
   appium-doctor --ios
   ```

## 📱 Configuración de Dispositivos

### Android Emulator

1. Abrir Android Studio
2. Ir a `Tools > Device Manager`
3. Crear o iniciar un emulador Android
4. Verificar que el emulador está corriendo:
   ```bash
   adb devices
   ```

### iOS Simulator

1. Listar simuladores disponibles:
   ```bash
   xcrun simctl list devices
   ```

2. Iniciar un simulador:
   ```bash
   open -a Simulator
   ```

## 🏗️ Build de la Aplicación

### Android APK

Desde el directorio raíz del proyecto Flutter:

```bash
cd ..  # Volver a Movil/
flutter build apk --debug
```

El APK se generará en: `build/app/outputs/flutter-apk/app-debug.apk`

### iOS App

```bash
flutter build ios --simulator
```

La app se generará en: `build/ios/iphonesimulator/Runner.app`

## ▶️ Ejecutar Pruebas

### Iniciar Appium Server

En una terminal separada:

```bash
appium
```

El servidor debería iniciar en `http://0.0.0.0:4723`

### Ejecutar Todas las Pruebas

```bash
npm test
```

### Ejecutar Solo Pruebas de Android

```bash
npm run test:android
```

### Ejecutar Solo Pruebas de iOS

```bash
npm run test:ios
```

### Ejecutar Pruebas con WebDriverIO

```bash
npx wdio run wdio.conf.js
```

## 📂 Estructura de Archivos

```
appium/
├── package.json              # Dependencias y scripts
├── wdio.conf.js             # Configuración de WebDriverIO
├── test/
│   └── specs/
│       └── wiicare.spec.js  # Casos de prueba
├── screenshots/             # Capturas generadas durante pruebas
└── README.md               # Este archivo
```

## 🧪 Casos de Prueba

### US1: Registro de Cuidador y Publicación de Servicio

- Completa el formulario de registro
- Selecciona rol de cuidador
- Verifica navegación exitosa
- Accede a la sección de servicios

### US2: Búsqueda de Cuidadores por Ubicación/Tipo

- Registra un usuario (no cuidador)
- Busca servicios por ubicación
- Verifica resultados de búsqueda

### US3: Login de Usuario y Acceso al Chat

- Inicia sesión con credenciales válidas
- Navega a la sección de chat
- Verifica visualización de conversaciones

## 🔍 Selectores de Elementos

Appium utiliza diferentes estrategias para encontrar elementos:

```javascript
// Por accessibility ID
const element = await driver.$('~element_id');

// Por texto (Android)
const element = await driver.$('android=new UiSelector().text("Texto")');

// Por texto (iOS)
const element = await driver.$('-ios predicate string:label == "Texto"');

// Por XPath
const element = await driver.$('//android.widget.Button[@text="Texto"]');
```

## 📸 Capturas de Pantalla

Las capturas se guardan automáticamente en el directorio `screenshots/` durante la ejecución de las pruebas.

Para tomar una captura manualmente en el código:

```javascript
await driver.saveScreenshot('./screenshots/mi-captura.png');
```

## ⚙️ Configuración de Capabilities

### Android

```javascript
{
  platformName: 'Android',
  'appium:deviceName': 'Android Emulator',
  'appium:platformVersion': '13.0',
  'appium:automationName': 'UiAutomator2',
  'appium:app': '/path/to/app-debug.apk'
}
```

### iOS

```javascript
{
  platformName: 'iOS',
  'appium:deviceName': 'iPhone 14',
  'appium:platformVersion': '16.0',
  'appium:automationName': 'XCUITest',
  'appium:app': '/path/to/Runner.app'
}
```

## 🐛 Troubleshooting

### Error: "Could not find 'adb'"

**Solución:** Agregar Android SDK platform-tools al PATH:

```bash
# En ~/.bashrc o ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Error: "Appium server not reachable"

**Solución:** Verificar que el servidor Appium esté corriendo:

```bash
appium
```

### Error: "Application is not installed"

**Solución:** Verificar la ruta del APK/App en `wdio.conf.js` y que el build esté actualizado.

### Error: "Session not created"

**Solución:** Verificar que el emulador/simulador esté corriendo:

```bash
# Android
adb devices

# iOS
xcrun simctl list devices | grep Booted
```

## 📊 Reportes

Los resultados de las pruebas se muestran en la consola. Para generar reportes HTML, puedes agregar un reporter:

```bash
npm install @wdio/allure-reporter --save-dev
```

Y configurarlo en `wdio.conf.js`.

## 🔗 Referencias

- [Appium Documentation](https://appium.io/docs/en/latest/)
- [WebDriverIO Documentation](https://webdriver.io/)
- [Appium Inspector](https://github.com/appium/appium-inspector) - Herramienta para inspeccionar elementos

## 📝 Notas Importantes

1. **Backend debe estar corriendo:** Las pruebas requieren que el backend de WiiCare esté disponible en `http://10.0.2.2:4000` (para Android emulator).

2. **Tiempos de espera:** Algunos tests tienen timeouts largos para permitir la carga de la app y respuestas del backend.

3. **Credenciales de prueba:** Los tests crean usuarios nuevos con timestamps para evitar conflictos.

4. **Screenshots:** Se generan automáticamente para evidencia de las pruebas de SQA.

## 👥 Contribuir

Para agregar nuevos casos de prueba:

1. Crear un nuevo archivo `.spec.js` en `test/specs/`
2. Seguir la estructura de los tests existentes
3. Agregar selectores con accessibility IDs para mayor confiabilidad
4. Incluir screenshots para evidencia
5. Documentar los pasos y expectativas

## 📄 Licencia

Este proyecto es parte de WiiCare y sigue la misma licencia del proyecto principal.
