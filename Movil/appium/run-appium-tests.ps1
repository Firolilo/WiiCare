# Script para ejecutar tests de Appium con variables de entorno configuradas

# Configurar variables de entorno de Android SDK
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\tools"
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin"

Write-Host "✅ Variables de entorno configuradas:" -ForegroundColor Green
Write-Host "   ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "   ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT"
Write-Host ""

# Verificar que el servidor Appium está corriendo
Write-Host "🔍 Verificando servidor Appium..." -ForegroundColor Yellow
$appiumRunning = Test-NetConnection -ComputerName localhost -Port 4723 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
if (-not $appiumRunning.TcpTestSucceeded) {
    Write-Host "❌ ERROR: El servidor Appium no está corriendo en el puerto 4723" -ForegroundColor Red
    Write-Host "   Por favor, inicia Appium en otra terminal con:" -ForegroundColor Yellow
    Write-Host "   appium --base-path /wd/hub" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ Servidor Appium detectado en puerto 4723" -ForegroundColor Green
Write-Host ""

# Ejecutar tests
Write-Host "🚀 Ejecutando tests de Appium..." -ForegroundColor Cyan
npx wdio run wdio.conf.js
