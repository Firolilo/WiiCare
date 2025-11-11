# 🧪 Guía de Pruebas - WiiCare Mobile

Esta guía te ayudará a ejecutar todas las pruebas del proyecto Flutter de WiiCare.

## 📋 Tipos de Pruebas Disponibles

1. **Unit Tests** - Pruebas unitarias de lógica de negocio
2. **Widget Tests** - Pruebas de widgets individuales
3. **Integration Tests** - Pruebas end-to-end ejecutables en dispositivo/emulador
4. **Flutter Driver Tests** - Pruebas de integración con Flutter Driver
5. **Appium Tests** - Pruebas con Appium para automatización avanzada

---

## 🚀 Configuración Inicial

### 1. Verificar Dependencias de Testing

```bash
cd Movil
flutter pub get
```

### 2. Asegurarse de que el Backend está corriendo

```bash
# En otra terminal:
cd Backend
npm run dev
```

El backend debe estar corriendo en `http://192.168.0.27:4000` (o la IP configurada en `constants.dart`)

---

## 🧪 Ejecutar Pruebas

### 1️⃣ Unit Tests y Widget Tests

Estas pruebas se ejecutan rápidamente sin necesidad de dispositivo.

```bash
# Ejecutar todas las pruebas en /test
flutter test

# Ejecutar un archivo específico
flutter test test/widget_test.dart

# Con cobertura de código
flutter test --coverage
```

**Salida esperada:**
```
00:01 +1: All tests passed!
```

---

### 2️⃣ Integration Tests

Estas pruebas requieren un dispositivo físico o emulador conectado.

```bash
# Listar dispositivos disponibles
flutter devices

# Ejecutar integration tests
flutter test integration_test/app_test.dart

# En un dispositivo específico
flutter test integration_test/app_test.dart -d <device-id>
```

**Incluye pruebas de:**
- ✅ US1: Registro de cuidador
- ✅ US2: Búsqueda de servicios
- ✅ US3: Login y chat
- ✅ Validaciones de formularios

**Duración estimada:** 2-3 minutos

---

### 3️⃣ Flutter Driver Tests

Pruebas E2E con control completo del dispositivo.

#### Paso 1: Iniciar la app instrumentada

```bash
# Terminal 1 - Iniciar app en modo test
flutter drive --target=test_driver/app.dart --driver=test_driver/app_test.dart
```

Este comando:
1. Compila la app con instrumentación
2. La instala en el dispositivo
3. Ejecuta los tests automáticamente
4. Genera reportes de performance

**Tests incluidos:**
- ✅ US1: Registro completo de cuidador
- ✅ US2: Búsqueda y filtrado de servicios
- ✅ US3: Login y envío de mensaje en chat
- ✅ Navegación entre pantallas
- ✅ Tests de performance (tiempo de arranque, scroll)

**Duración estimada:** 5-7 minutos

---

### 4️⃣ Appium Tests

Para pruebas avanzadas con WebDriverIO.

#### Requisitos previos

```bash
# Instalar Appium globalmente
npm install -g appium

# Instalar dependencias del proyecto
cd appium
npm install

# Verificar que Appium funciona
appium --version
```

#### Ejecutar Appium Tests

```bash
# Terminal 1 - Iniciar servidor Appium
appium

# Terminal 2 - Ejecutar tests
cd Movil/appium
npm test
```

**Configuración automática:**
- ✅ Detecta dispositivo Android conectado
- ✅ Instala y lanza la app automáticamente
- ✅ Toma screenshots en cada paso
- ✅ Genera reportes HTML

**Tests incluidos:**
- US1: Registro de cuidador con captura de pantalla
- US2: Búsqueda de servicios con filtros
- US3: Login y envío de mensajes

**Ubicación de screenshots:** `Movil/appium/screenshots/`

**Duración estimada:** 8-10 minutos

---

## 📊 Ver Reportes de Cobertura

Después de ejecutar tests con `--coverage`:

```bash
# Instalar lcov (si no lo tienes)
# Windows (con Chocolatey):
choco install lcov

# Generar reporte HTML
genhtml coverage/lcov.info -o coverage/html

# Abrir en el navegador
start coverage/html/index.html
```

---

## 🐛 Troubleshooting

### Error: "No devices found"

```bash
# Verificar dispositivos conectados
flutter devices
adb devices

# Reiniciar ADB
adb kill-server
adb start-server
```

### Error: "Connection refused" en tests

- Verifica que el backend esté corriendo
- Verifica la IP en `lib/utils/constants.dart`
- Para dispositivo físico, usa la IP de tu PC (no `10.0.2.2`)
- Para emulador, usa `10.0.2.2`

### Flutter Driver falla al conectarse

```bash
# Limpiar y reconstruir
flutter clean
flutter pub get
flutter drive --target=test_driver/app.dart --driver=test_driver/app_test.dart
```

### Appium no encuentra el dispositivo

```bash
# Verificar configuración en wdio.conf.js
# Asegúrate de que el deviceName y platformVersion coincidan

# Listar dispositivos Android
adb devices -l
```

---

## 🎯 Checklist Pre-Pruebas

Antes de ejecutar las pruebas, verifica:

- [ ] Backend corriendo en `http://<tu-ip>:4000`
- [ ] Base de datos tiene usuarios de prueba (ejecutar `node scripts/seed.js`)
- [ ] Dispositivo/emulador conectado y desbloqueado
- [ ] App compilada sin errores (`flutter run`)
- [ ] Permisos de red habilitados en AndroidManifest.xml

---

## 📝 Datos de Prueba

Los siguientes usuarios están disponibles en la base de datos (después de ejecutar seed):

**Usuario Regular:**
- Email: `test@example.com`
- Password: `password123`

**Cuidador:**
- Email: `test@caregiver.com`
- Password: `password123`

**Usuario Demo:**
- Email: `demo@example.com`
- Password: `demo123`

---

## 🚀 CI/CD - GitHub Actions

Las pruebas también se ejecutan automáticamente en cada push/PR gracias a `.github/workflows/mobile-ci.yml`

**Workflow incluye:**
1. Setup de Flutter
2. Análisis estático (`flutter analyze`)
3. Unit tests (`flutter test`)
4. Integration tests (en emulador)
5. Generación de reportes

Ver resultados en: `https://github.com/Firolilo/WiiCare/actions`

---

## 📚 Recursos Adicionales

- [Flutter Testing Guide](https://docs.flutter.dev/testing)
- [Flutter Driver](https://docs.flutter.dev/testing/integration-tests)
- [Appium Documentation](http://appium.io/docs/en/latest/)
- [WebDriverIO](https://webdriver.io/)

---

## 💡 Tips y Mejores Prácticas

1. **Ejecuta tests frecuentemente** durante el desarrollo
2. **Usa `flutter test --watch`** para re-ejecutar tests automáticamente
3. **Escribe tests para nuevas features** antes de implementarlas (TDD)
4. **Mantén tests independientes** - cada test debe poder ejecutarse solo
5. **Usa `setUp()` y `tearDown()`** para configuración común
6. **Mock servicios externos** en unit tests para velocidad
7. **Captura screenshots** en tests de UI para documentación

---

¿Necesitas ayuda? Revisa los logs detallados con `flutter test --verbose` o `flutter drive -v`
