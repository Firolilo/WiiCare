# Script para iniciar Appium Server
# Ejecutar en una terminal separada antes de correr los tests

Write-Host "🚀 Iniciando Appium Server..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Appium está instalado
try {
    $version = appium --version 2>&1
    Write-Host "✅ Appium $version instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Appium no está instalado" -ForegroundColor Red
    Write-Host "Instala con: npm install -g appium@2.11.5" -ForegroundColor Yellow
    Write-Host "Luego: appium driver install uiautomator2" -ForegroundColor Yellow
    exit 1
}

# Verificar driver de UiAutomator2
Write-Host "📱 Verificando driver de UiAutomator2..." -ForegroundColor Cyan
$drivers = appium driver list --installed 2>&1 | Select-String "uiautomator2"
if (-not $drivers) {
    Write-Host "⚠️  Driver UiAutomator2 no instalado" -ForegroundColor Yellow
    Write-Host "Instalando..." -ForegroundColor Cyan
    cd $env:TEMP
    appium driver install uiautomator2
    cd -
}

Write-Host ""
Write-Host "✅ Todo listo. Iniciando servidor en http://127.0.0.1:4723" -ForegroundColor Green
Write-Host "📝 Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Iniciar Appium
appium
