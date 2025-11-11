# Script para iniciar servidor Appium con variables de entorno configuradas

# Configurar variables de entorno de Android SDK
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\tools"
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin"

# IMPORTANTE: Usar el APPIUM_HOME de la RAÍZ del proyecto (donde está el driver)
$env:APPIUM_HOME = "C:\Users\lenovo\.appium"

Write-Host "🚀 Iniciando servidor Appium..." -ForegroundColor Cyan
Write-Host "   ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
Write-Host "   ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT" -ForegroundColor Green
Write-Host "   APPIUM_HOME: $env:APPIUM_HOME" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Mantén esta terminal abierta mientras ejecutas los tests" -ForegroundColor Yellow
Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Verificando drivers instalados..." -ForegroundColor Cyan
appium driver list --installed
Write-Host ""

# Iniciar Appium con el driver global
Write-Host "🔧 Iniciando servidor en http://127.0.0.1:4723/wd/hub" -ForegroundColor Cyan
appium --base-path /wd/hub
