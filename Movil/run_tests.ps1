# WiiCare Mobile - Test Runner Script
# Ejecuta diferentes tipos de pruebas para la app Flutter

param(
    [Parameter(Position=0)]
    [ValidateSet("unit", "integration", "driver", "appium", "all", "coverage")]
    [string]$TestType = "unit"
)

$ErrorActionPreference = "Stop"

Write-Host "🧪 WiiCare Mobile - Test Runner" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (!(Test-Path "pubspec.yaml")) {
    Write-Host "❌ Error: Ejecuta este script desde la carpeta Movil/" -ForegroundColor Red
    exit 1
}

switch ($TestType) {
    "unit" {
        Write-Host "🔬 Ejecutando Unit Tests y Widget Tests..." -ForegroundColor Yellow
        Write-Host ""
        flutter test
    }
    
    "integration" {
        Write-Host "🔗 Ejecutando Integration Tests..." -ForegroundColor Yellow
        Write-Host ""
        
        # Verificar dispositivo conectado
        Write-Host "📱 Verificando dispositivos conectados..." -ForegroundColor Cyan
        flutter devices
        Write-Host ""
        
        Read-Host "Presiona Enter para continuar o Ctrl+C para cancelar"
        
        flutter test integration_test/app_test.dart
    }
    
    "driver" {
        Write-Host "🚗 Ejecutando Flutter Driver E2E Tests..." -ForegroundColor Yellow
        Write-Host ""
        
        # Verificar dispositivo conectado
        Write-Host "📱 Verificando dispositivos conectados..." -ForegroundColor Cyan
        flutter devices
        Write-Host ""
        
        Read-Host "Presiona Enter para continuar o Ctrl+C para cancelar"
        
        flutter drive --target=test_driver/app.dart --driver=test_driver/app_test.dart
    }
    
    "appium" {
        Write-Host "🤖 Ejecutando Appium Tests..." -ForegroundColor Yellow
        Write-Host ""
        
        # Verificar si Appium está instalado
        try {
            appium --version | Out-Null
        } catch {
            Write-Host "❌ Error: Appium no está instalado" -ForegroundColor Red
            Write-Host "Instala con: npm install -g appium" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "1️⃣ Iniciando servidor Appium..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "appium"
        
        Start-Sleep -Seconds 3
        
        Write-Host "2️⃣ Ejecutando tests de Appium..." -ForegroundColor Green
        Push-Location appium
        
        if (!(Test-Path "node_modules")) {
            Write-Host "📦 Instalando dependencias de Appium..." -ForegroundColor Yellow
            npm install
        }
        
        npm test
        Pop-Location
    }
    
    "coverage" {
        Write-Host "📊 Generando reporte de cobertura..." -ForegroundColor Yellow
        Write-Host ""
        
        # Ejecutar tests con cobertura
        flutter test --coverage
        
        # Verificar si lcov está instalado
        Write-Host ""
        Write-Host "Generando reporte HTML..." -ForegroundColor Cyan
        
        if (Get-Command genhtml -ErrorAction SilentlyContinue) {
            genhtml coverage/lcov.info -o coverage/html
            Write-Host "✅ Reporte generado en: coverage/html/index.html" -ForegroundColor Green
            
            # Abrir en navegador
            Start-Process coverage/html/index.html
        } else {
            Write-Host "⚠️ lcov no está instalado. Instala con:" -ForegroundColor Yellow
            Write-Host "  choco install lcov" -ForegroundColor White
            Write-Host ""
            Write-Host "Reporte raw disponible en: coverage/lcov.info" -ForegroundColor Cyan
        }
    }
    
    "all" {
        Write-Host "🎯 Ejecutando TODAS las pruebas..." -ForegroundColor Yellow
        Write-Host "Esto puede tomar varios minutos." -ForegroundColor Yellow
        Write-Host ""
        
        Read-Host "Presiona Enter para continuar o Ctrl+C para cancelar"
        
        # 1. Unit tests
        Write-Host ""
        Write-Host "1️⃣ Unit Tests..." -ForegroundColor Green
        flutter test
        
        # 2. Integration tests
        Write-Host ""
        Write-Host "2️⃣ Integration Tests..." -ForegroundColor Green
        flutter test integration_test/app_test.dart
        
        # 3. Driver tests
        Write-Host ""
        Write-Host "3️⃣ Flutter Driver Tests..." -ForegroundColor Green
        flutter drive --target=test_driver/app.dart --driver=test_driver/app_test.dart
        
        Write-Host ""
        Write-Host "✅ Todas las pruebas completadas!" -ForegroundColor Green
    }
    
    default {
        Write-Host "❌ Tipo de test desconocido: $TestType" -ForegroundColor Red
        Write-Host ""
        Write-Host "Uso: .\run_tests.ps1 [unit|integration|driver|appium|all|coverage]" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "✨ Test completado!" -ForegroundColor Green
