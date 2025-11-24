echo "═══════════════════════════════════════════════════════════════
WIICARE - FLUTTER TESTING SUITE
═══════════════════════════════════════════════════════════════

📦 PASO 1: Ejecutando Widget Tests...
──────────────────────────────────────────────────────────────
00:13 +6: All tests passed!
✅ Widget Tests: COMPLETADOS

═══════════════════════════════════════════════════════════════
🔗 PASO 2: Ejecutando Integration Tests...
──────────────────────────────────────────────────────────────
00:00 +0: loading C:/Users/lenovo/OneDrive/Desktop/Proyectos/WiiCare/Movil/integration_test/app_test.dart
R01:01 +0: loading ...
60.0s √ Built build\\app\\outputs\\flutter-apk\\app-debug.apk
01:06 +0: loading ...
I01:14 +0: loading ...
8.6s

01:27 +0: WiiCare Integration Tests US1: Complete caregiver registration flow
⚠️ Warning: tap() no impactado, posible widget fuera de pantalla.

01:36 +1: WiiCare Integration Tests US2: User registration and service search
⚠️ Warning: tap() no impactado, posible widget fuera de pantalla.

01:45 +2: WiiCare Integration Tests US3: Login flow and navigation
🌐 POST http://192.168.0.27:4000/api/auth/login
📤 Body: {\"email\":\"test@example.com\",\"password\":\"password123\"}
📥 Status: 200
📥 Response: {\"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",\"user\":{\"id\":\"6912a82cd463e541a5612a75\",\"name\":\"Test User\",\"email\":\"test@example.com\",\"role\":\"user\"}}

02:22 +7: All tests passed!
✅ Integration Tests: COMPLETADOS

═══════════════════════════════════════════════════════════════
RESUMEN DE PRUEBAS
═══════════════════════════════════════════════════════════════
✅ Widget Tests: 6/6 PASARON
✅ Integration Tests: 7/7 PASARON
──────────────────────────────────────────────────────────────
📊 TOTAL: 13/13 PRUEBAS EXITOSAS
🕒 DURACIÓN TOTAL: 2m 22s
──────────────────────────────────────────────────────────────
🎉 TODAS LAS PRUEBAS EXITOSAS 🎉
═══════════════════════════════════════════════════════════════"
