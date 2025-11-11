# 🎯 Quick Testing Reference

## 1️⃣ Pruebas Rápidas (Sin Dispositivo)

```bash
flutter test
```

**Qué hace:**
- ✅ Ejecuta unit tests
- ✅ Ejecuta widget tests
- ⏱️ Duración: ~10 segundos
- 📍 Archivos: `test/**/*.dart`

---

## 2️⃣ Integration Tests (Con Dispositivo)

```bash
# Conecta tu dispositivo/emulador primero
flutter devices

# Ejecuta integration tests
flutter test integration_test/app_test.dart
```

**Qué hace:**
- ✅ Prueba registro de usuario
- ✅ Prueba búsqueda de servicios
- ✅ Prueba login y chat
- ⏱️ Duración: ~2-3 minutos
- 📍 Archivos: `integration_test/**/*.dart`

---

## 3️⃣ Flutter Driver E2E Tests

```bash
flutter drive \
  --target=test_driver/app.dart \
  --driver=test_driver/app_test.dart
```

**Qué hace:**
- ✅ Flujos completos end-to-end
- ✅ Tests de performance
- ✅ Navegación completa
- ⏱️ Duración: ~5-7 minutos
- 📍 Archivos: `test_driver/**/*.dart`

---

## 4️⃣ Appium Tests (Más Avanzado)

### Terminal 1 - Servidor Appium:
```bash
appium
```

### Terminal 2 - Ejecutar Tests:
```bash
cd appium
npm install  # Solo primera vez
npm test
```

**Qué hace:**
- ✅ Automatización completa
- ✅ Screenshots automáticos
- ✅ Reportes HTML
- ⏱️ Duración: ~8-10 minutos
- 📍 Archivos: `appium/test/**/*.js`

---

## 📊 Ver Cobertura de Código

```bash
# 1. Ejecutar tests con cobertura
flutter test --coverage

# 2. Generar reporte HTML
genhtml coverage/lcov.info -o coverage/html

# 3. Abrir en navegador
start coverage/html/index.html  # Windows
open coverage/html/index.html   # macOS
xdg-open coverage/html/index.html  # Linux
```

---

## 🐛 Troubleshooting Rápido

### "No devices found"
```bash
flutter devices
adb devices  # Android
adb kill-server && adb start-server
```

### "Connection refused"
- ✅ Verifica que el backend esté corriendo: `npm --workspace Backend run dev`
- ✅ Verifica la IP en `lib/utils/constants.dart`

### "Build failed"
```bash
flutter clean
flutter pub get
flutter run
```

---

## 📝 Checklist Pre-Testing

- [ ] Backend corriendo en puerto 4000
- [ ] Base de datos seeded (`node Backend/scripts/seed.js`)
- [ ] Dispositivo conectado (`flutter devices`)
- [ ] App compila sin errores (`flutter run`)
- [ ] Permisos de red habilitados

---

## 💡 Tips

1. **Ejecuta tests frecuentemente** mientras desarrollas
2. **Usa `flutter test --watch`** para auto-reload
3. **Revisa logs con `-v`** si algo falla: `flutter test -v`
4. **Para tests específicos** usa patrones:
   ```bash
   flutter test test/models/user_test.dart
   flutter test --name "User model"
   ```

---

Para más detalles, consulta **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**
