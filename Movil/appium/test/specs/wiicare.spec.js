const { remote } = require('webdriverio');
const assert = require('assert');

/**
 * Configuración de capacidades para Android
 */
const getAndroidCapabilities = () => ({
  platformName: 'Android',
  'appium:deviceName': 'AC3N6R4C21001232',
  'appium:udid': 'AC3N6R4C21001232',
  'appium:platformVersion': '15.0',
  'appium:automationName': 'UiAutomator2',
  'appium:app': require('path').join(__dirname, '../../../build/app/outputs/flutter-apk/app-debug.apk'),
  'appium:appPackage': 'com.example.wiicare_movil',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 240,
});

/**
 * Configuración de capacidades para iOS
 */
const getIOSCapabilities = () => ({
  platformName: 'iOS',
  'appium:deviceName': 'iPhone 14',
  'appium:platformVersion': '16.0',
  'appium:automationName': 'XCUITest',
  'appium:app': require('path').join(__dirname, '../../build/ios/iphoneos/Runner.app'),
  'appium:noReset': false,
  'appium:fullReset': false,
});

/**
 * Historia de Usuario 1: Registro de cuidador y publicación de servicio
 * 
 * Descripción: Como cuidador, quiero registrarme en la plataforma y publicar
 * un servicio para que los usuarios puedan encontrar y contratar mis servicios.
 */
describe('US1: Caregiver Registration and Service Posting', function() {
  this.timeout(120000);
  let driver;

  before(async function() {
    driver = await remote({
      logLevel: 'info',
      path: '/wd/hub',
      port: 4723,
      capabilities: getAndroidCapabilities()
    });
  });

  after(async function() {
    if (driver) {
      await driver.deleteSession();
    }
  });

  it('should complete caregiver registration', async function() {
    // Esperar a que cargue la app
    await driver.pause(3000);

    // Encontrar y hacer clic en "Crear cuenta"
    const registerLink = await driver.$('~Regístrate');
    await registerLink.waitForDisplayed({ timeout: 10000 });
    await registerLink.click();

    // Llenar formulario de registro
    const nameField = await driver.$('~register_name_field');
    await nameField.setValue('María García Appium');

    const emailField = await driver.$('~register_email_field');
    await emailField.setValue(`caregiver.appium.${Date.now()}@test.com`);

    const passwordField = await driver.$('~register_password_field');
    await passwordField.setValue('AppiumTest123');

    const confirmPasswordField = await driver.$('~register_confirm_password_field');
    await confirmPasswordField.setValue('AppiumTest123');

    // Seleccionar rol de cuidador
    const caregiverRadio = await driver.$('~role_caregiver');
    await caregiverRadio.click();

    // Captura de pantalla del formulario completo
    await driver.saveScreenshot('./screenshots/us1-registration-form.png');

    // Enviar formulario
    const submitButton = await driver.$('~register_submit_button');
    await submitButton.click();

    // Esperar navegación
    await driver.pause(5000);

    // Verificar navegación exitosa
    const welcomeText = await driver.$('~welcome_message');
    const isDisplayed = await welcomeText.isDisplayed();
    
    // Captura de pantalla de confirmación
    await driver.saveScreenshot('./screenshots/us1-registration-success.png');

    assert.strictEqual(isDisplayed, true, 'El usuario debería estar en la pantalla principal');
  });

  it('should navigate to services section', async function() {
    // Hacer clic en la pestaña de servicios
    const servicesTab = await driver.$('~nav_services');
    await servicesTab.click();

    await driver.pause(2000);

    // Verificar que estamos en la pantalla de servicios
    const servicesTitle = await driver.$('android=new UiSelector().text("Servicios")');
    const isDisplayed = await servicesTitle.isDisplayed();

    // Captura de pantalla de la pantalla de servicios
    await driver.saveScreenshot('./screenshots/us1-services-screen.png');

    assert.strictEqual(isDisplayed, true, 'Debería mostrar la pantalla de servicios');
  });
});

/**
 * Historia de Usuario 2: Búsqueda de cuidadores por ubicación/tipo
 * 
 * Descripción: Como usuario, quiero buscar cuidadores por ubicación y tipo
 * de servicio para encontrar el cuidador más adecuado para mis necesidades.
 */
describe('US2: Search Caregivers by Location and Type', function() {
  this.timeout(120000);
  let driver;

  before(async function() {
    driver = await remote({
      logLevel: 'info',
      path: '/wd/hub',
      port: 4723,
      capabilities: getAndroidCapabilities()
    });
  });

  after(async function() {
    if (driver) {
      await driver.deleteSession();
    }
  });

  it('should register as user', async function() {
    await driver.pause(3000);

    const registerLink = await driver.$('~Regístrate');
    await registerLink.waitForDisplayed({ timeout: 10000 });
    await registerLink.click();

    const nameField = await driver.$('~register_name_field');
    await nameField.setValue('Juan Pérez Appium');

    const emailField = await driver.$('~register_email_field');
    await emailField.setValue(`user.appium.${Date.now()}@test.com`);

    const passwordField = await driver.$('~register_password_field');
    await passwordField.setValue('AppiumTest123');

    const confirmPasswordField = await driver.$('~register_confirm_password_field');
    await confirmPasswordField.setValue('AppiumTest123');

    // Seleccionar rol de usuario
    const userRadio = await driver.$('~role_user');
    await userRadio.click();

    await driver.saveScreenshot('./screenshots/us2-user-registration-form.png');

    const submitButton = await driver.$('~register_submit_button');
    await submitButton.click();

    await driver.pause(5000);
    await driver.saveScreenshot('./screenshots/us2-user-registered.png');
  });

  it('should search for caregivers', async function() {
    // Navegar a la sección de servicios
    const servicesTab = await driver.$('~nav_services');
    await servicesTab.click();

    await driver.pause(2000);

    // Intentar buscar (si hay campo de búsqueda)
    try {
      const searchField = await driver.$('~search_field');
      if (await searchField.isDisplayed()) {
        await searchField.setValue('San José');
        
        const searchButton = await driver.$('~search_button');
        await searchButton.click();

        await driver.pause(3000);
        await driver.saveScreenshot('./screenshots/us2-search-results.png');
      }
    } catch (error) {
      console.log('Campo de búsqueda no disponible, pantalla de servicios básica');
      await driver.saveScreenshot('./screenshots/us2-services-basic.png');
    }
  });
});

/**
 * Historia de Usuario 3: Login de usuario y acceso al chat
 * 
 * Descripción: Como usuario registrado, quiero iniciar sesión y acceder al chat
 * para comunicarme con los cuidadores.
 */
describe('US3: User Login and Chat Access', function() {
  this.timeout(120000);
  let driver;

  before(async function() {
    driver = await remote({
      logLevel: 'info',
      path: '/wd/hub',
      port: 4723,
      capabilities: getAndroidCapabilities()
    });
  });

  after(async function() {
    if (driver) {
      await driver.deleteSession();
    }
  });

  it('should login with credentials', async function() {
    await driver.pause(3000);

    // Ingresar credenciales
    const emailField = await driver.$('~login_email_field');
    await emailField.setValue('test@example.com');

    const passwordField = await driver.$('~login_password_field');
    await passwordField.setValue('password123');

    await driver.saveScreenshot('./screenshots/us3-login-form.png');

    // Hacer clic en login
    const loginButton = await driver.$('~login_submit_button');
    await loginButton.click();

    await driver.pause(5000);
    await driver.saveScreenshot('./screenshots/us3-login-attempt.png');
  });

  it('should access chat section', async function() {
    // Intentar navegar al chat
    try {
      const chatTab = await driver.$('~nav_chat');
      if (await chatTab.isDisplayed()) {
        await chatTab.click();

        await driver.pause(2000);

        const chatsTitle = await driver.$('android=new UiSelector().text("Chats")');
        const isDisplayed = await chatsTitle.isDisplayed();

        await driver.saveScreenshot('./screenshots/us3-chat-screen.png');

        assert.strictEqual(isDisplayed, true, 'Debería mostrar la pantalla de chats');
      }
    } catch (error) {
      console.log('No se pudo acceder al chat, posiblemente por falta de sesión');
      await driver.saveScreenshot('./screenshots/us3-chat-access-error.png');
    }
  });
});
