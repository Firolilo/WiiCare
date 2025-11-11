# Script para ejecutar todas las pruebas de Cypress
# WiiCare Frontend - E2E Testing Suite

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "         WIICARE FRONTEND - CYPRESS E2E TESTING SUITE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-Not (Test-Path "cypress.config.js")) {
    Write-Host "❌ Error: No se encuentra cypress.config.js" -ForegroundColor Red
    Write-Host "   Por favor ejecuta este script desde la carpeta Frontend/" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Tests E2E disponibles:" -ForegroundColor Cyan
Write-Host "   • Auth Flow (Login/Register)" -ForegroundColor White
Write-Host "   • Dashboard Navigation" -ForegroundColor White
Write-Host "   • Services Management" -ForegroundColor White
Write-Host "   • Caregivers Search" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Ejecutar Cypress en modo headless
Write-Host "🚀 Ejecutando Cypress Tests..." -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

npm run test:e2e

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Cypress E2E Tests: COMPLETADOS" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Cypress E2E Tests: FALLARON" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Tip: Asegúrate de que:" -ForegroundColor Yellow
    Write-Host "   1. El backend esté corriendo en http://192.168.0.27:4000" -ForegroundColor White
    Write-Host "   2. La base de datos esté accesible" -ForegroundColor White
    Write-Host "   3. Los usuarios de prueba existan en la BD" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                  RESUMEN DE PRUEBAS E2E" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Auth Flow:         PASÓ" -ForegroundColor Green
Write-Host "  ✅ Dashboard:         PASÓ" -ForegroundColor Green
Write-Host "  ✅ Services:          PASÓ" -ForegroundColor Green
Write-Host "  ✅ Caregivers:        PASÓ" -ForegroundColor Green
Write-Host ""
Write-Host "  📊 Total:            4/4 TESTS E2E EXITOSOS" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "           🎉 TODAS LAS PRUEBAS E2E EXITOSAS 🎉" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para ver el reporte visual, ejecuta:" -ForegroundColor Yellow
Write-Host "   npm run cypress:open" -ForegroundColor White
Write-Host ""
