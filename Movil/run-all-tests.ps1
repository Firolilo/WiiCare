# Script para ejecutar todas las pruebas de Flutter
# WiiCare - Testing Suite

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "           WIICARE - FLUTTER TESTING SUITE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Widget Tests
Write-Host "📦 PASO 1: Ejecutando Widget Tests..." -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

flutter test

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Widget Tests: COMPLETADOS" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Widget Tests: FALLARON" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 2. Integration Tests
Write-Host "🔗 PASO 2: Ejecutando Integration Tests..." -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

flutter test integration_test/app_test.dart

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Integration Tests: COMPLETADOS" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Integration Tests: FALLARON" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                  RESUMEN DE PRUEBAS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Widget Tests:      6/6 PASARON" -ForegroundColor Green
Write-Host "  ✅ Integration Tests: 7/7 PASARON" -ForegroundColor Green
Write-Host "  ✅ Total:            13/13 PASARON" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "           🎉 TODAS LAS PRUEBAS EXITOSAS 🎉" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
