# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                  WiiCare Backend - API Testing con Newman                   ║
# ║                      Postman Collection Test Runner                         ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "            WIICARE - PRUEBAS API con POSTMAN/NEWMAN              " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar que Newman esté instalado
Write-Host "📋 Verificando dependencias..." -ForegroundColor Yellow
if (-not (Get-Command newman -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Newman no está instalado." -ForegroundColor Red
    Write-Host "   Instálalo con: npm install -g newman" -ForegroundColor Yellow
    exit 1
}

# Verificar que la colección de Postman existe
$collectionPath = "..\postman\WiiCare.postman_collection.json"
if (-not (Test-Path $collectionPath)) {
    Write-Host "❌ Colección de Postman no encontrada en: $collectionPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Newman instalado correctamente" -ForegroundColor Green
Write-Host "✅ Colección encontrada: WiiCare.postman_collection.json" -ForegroundColor Green
Write-Host ""

# Mostrar información de la colección
Write-Host "─────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "📦 Colección: WiiCare API" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "   📁 Auth             → Register (1 test), Login (3 tests), Me (2 tests)" -ForegroundColor White
Write-Host "   📁 Services         → Get All (2 tests), Search (2 tests)" -ForegroundColor White
Write-Host "   � Total Assertions → 10 validaciones automáticas" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

Write-Host "⚠️  IMPORTANTE: Asegúrate de que:" -ForegroundColor Yellow
Write-Host "   1. El backend esté corriendo en http://44.211.88.225" -ForegroundColor White
Write-Host "   2. MongoDB esté activo y accesible" -ForegroundColor White
Write-Host "   3. Las variables de entorno (.env) estén configuradas" -ForegroundColor White
Write-Host ""

# Esperar confirmación
Write-Host "Presiona ENTER para ejecutar las pruebas..." -ForegroundColor Cyan
Read-Host

# Ejecutar Newman
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "            ▶️  EJECUTANDO PRUEBAS DE API                          " -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Ejecutar Newman con CLI reporter solamente
$newmanCommand = "newman run `"$collectionPath`" --color on"

try {
    Invoke-Expression $newmanCommand
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    if ($exitCode -eq 0) {
        Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "                 ✅ TODAS LAS PRUEBAS PASARON                     " -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Colección ejecutada exitosamente!" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Red
        Write-Host "                 ❌ ALGUNAS PRUEBAS FALLARON                      " -ForegroundColor Red
        Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Revisa:" -ForegroundColor Yellow
        Write-Host "   • ¿El backend está corriendo? npm run dev" -ForegroundColor White
        Write-Host "   • ¿MongoDB está activo?" -ForegroundColor White
        Write-Host "   • ¿Las credenciales en .env son correctas?" -ForegroundColor White
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host "❌ Error al ejecutar Newman: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Ayuda:" -ForegroundColor Yellow
    Write-Host "   • Verifica que Newman esté instalado: newman --version" -ForegroundColor White
    Write-Host "   • Reinstala si es necesario: npm install -g newman" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Presiona ENTER para salir..." -ForegroundColor Gray
Read-Host
