# Script para ejecutar tests de Appium
# Ejecutar DESPUÉS de iniciar el servidor con start-appium.ps1

param(
    [string]$Suite = "all"  # "all", "login", "services", "us1", "us2", "us3"
)

Write-Host "🧪 Preparando ejecución de tests de Appium" -ForegroundColor Cyan
Write-Host ""

# Navegar a la carpeta de Appium
Set-Location $PSScriptRoot

# Verificar que el APK existe
$apkPath = "..\build\app\outputs\flutter-apk\app-debug.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "❌ APK no encontrado en: $apkPath" -ForegroundColor Red
    Write-Host "Construyendo APK..." -ForegroundColor Yellow
    Set-Location ..
    flutter build apk --debug
    Set-Location appium
    
    if (-not (Test-Path $apkPath)) {
        Write-Host "❌ Fallo al construir el APK" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ APK encontrado" -ForegroundColor Green

# Verificar que Appium está corriendo
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:4723/status" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Servidor Appium está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor Appium no está corriendo en http://127.0.0.1:4723" -ForegroundColor Red
    Write-Host "Ejecuta en otra terminal: .\start-appium.ps1" -ForegroundColor Yellow
    exit 1
}

# Verificar que hay un dispositivo conectado
Write-Host "📱 Verificando dispositivos..." -ForegroundColor Cyan
$devices = adb devices | Select-String "device$"
if ($devices.Count -eq 0) {
    Write-Host "⚠️  No hay dispositivos conectados" -ForegroundColor Yellow
    Write-Host "Conecta un dispositivo Android o inicia un emulador" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Dispositivo detectado" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 Ejecutando tests: $Suite" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Ejecutar tests según el parámetro
switch ($Suite) {
    "login" {
        npx wdio run wdio.conf.js --spec test/specs/login.spec.js
    }
    "services" {
        npx wdio run wdio.conf.js --spec test/specs/services.spec.js
    }
    "us1" {
        npx wdio run wdio.conf.js --spec test/specs/US1-login-test.spec.js
    }
    "us2" {
        npx wdio run wdio.conf.js --spec test/specs/US2-services-test.spec.js
    }
    "us3" {
        npx wdio run wdio.conf.js --spec test/specs/US3-chat-test.spec.js
    }
    default {
        npm test
    }
}

Write-Host ""
Write-Host "✅ Tests completados" -ForegroundColor Green
