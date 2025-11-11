# Setup Script for WiiCare Mobile App
# Run this script to install dependencies and prepare the app

Write-Host "🚀 WiiCare Mobile Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if Flutter is installed
Write-Host "✓ Checking Flutter installation..." -ForegroundColor Yellow
try {
    $flutterVersion = flutter --version 2>&1 | Select-String "Flutter" | Select-Object -First 1
    Write-Host "  Found: $flutterVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Flutter not found. Please install Flutter first." -ForegroundColor Red
    Write-Host "     Visit: https://flutter.dev/docs/get-started/install" -ForegroundColor Yellow
    exit 1
}

# Navigate to Movil directory
Write-Host ""
Write-Host "✓ Navigating to Movil directory..." -ForegroundColor Yellow
Set-Location -Path "Movil"

# Install Flutter dependencies
Write-Host ""
Write-Host "✓ Installing Flutter dependencies..." -ForegroundColor Yellow
flutter pub get

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Generate code with build_runner
Write-Host ""
Write-Host "✓ Generating code with build_runner..." -ForegroundColor Yellow
flutter pub run build_runner build --delete-conflicting-outputs

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️  Code generation failed (this is expected if there are no .g.dart files to generate)" -ForegroundColor Yellow
}

# Create .env file if it doesn't exist
Write-Host ""
Write-Host "✓ Creating .env file..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  Created .env file from .env.example" -ForegroundColor Green
    Write-Host "  ⚠️  Please update API_BASE_URL in .env if needed" -ForegroundColor Yellow
} else {
    Write-Host "  .env file already exists" -ForegroundColor Green
}

# Run Flutter doctor
Write-Host ""
Write-Host "✓ Running Flutter doctor..." -ForegroundColor Yellow
flutter doctor

# Check for Android SDK
Write-Host ""
Write-Host "✓ Checking Android SDK..." -ForegroundColor Yellow
$androidHome = $env:ANDROID_HOME
if ($androidHome) {
    Write-Host "  Found Android SDK at: $androidHome" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  ANDROID_HOME not set. Please install Android Studio." -ForegroundColor Yellow
}

# Setup Appium (optional)
Write-Host ""
$setupAppium = Read-Host "Do you want to setup Appium tests? (y/n)"
if ($setupAppium -eq "y" -or $setupAppium -eq "Y") {
    Write-Host "✓ Setting up Appium..." -ForegroundColor Yellow
    Set-Location -Path "appium"
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Host "  Found Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
        Write-Host "     Visit: https://nodejs.org/" -ForegroundColor Yellow
        Set-Location -Path ".."
        exit 1
    }
    
    # Install Appium dependencies
    npm install
    Write-Host "  Appium dependencies installed" -ForegroundColor Green
    
    # Check if Appium is installed globally
    try {
        $appiumVersion = appium --version
        Write-Host "  Found Appium: $appiumVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Appium not installed globally" -ForegroundColor Yellow
        $installAppium = Read-Host "Install Appium globally? (y/n)"
        if ($installAppium -eq "y" -or $installAppium -eq "Y") {
            npm install -g appium
            Write-Host "  Appium installed globally" -ForegroundColor Green
        }
    }
    
    Set-Location -Path ".."
}

# Success message
Write-Host ""
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update .env file with your API endpoint" -ForegroundColor White
Write-Host "  2. Start an Android emulator or connect a device" -ForegroundColor White
Write-Host "  3. Run: flutter run" -ForegroundColor White
Write-Host ""
Write-Host "For testing:" -ForegroundColor Yellow
Write-Host "  - Unit tests: flutter test" -ForegroundColor White
Write-Host "  - Integration tests: flutter test integration_test/app_test.dart" -ForegroundColor White
Write-Host "  - Driver tests: flutter drive --target=test_driver/app.dart" -ForegroundColor White
Write-Host "  - Appium tests: cd appium && npm test" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Cyan
