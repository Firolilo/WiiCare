const path = require('path');

exports.config = {
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  path: '/wd/hub',  // Appium base path
  port: 4723,
  hostname: '127.0.0.1',

  // ==================
  // Specify Test Files
  // ==================
  specs: [
    './test/specs/**/*.js'
  ],
  exclude: [],

  // ============
  // Capabilities
  // ============
  maxInstances: 1,
  capabilities: [
    {
      // Android capabilities - Dispositivo Real
      platformName: 'Android',
      'appium:deviceName': 'AC3N6R4C21001232', // Dispositivo real conectado
      'appium:udid': 'AC3N6R4C21001232',
      'appium:platformVersion': '15.0', // Android 15
      'appium:automationName': 'UiAutomator2',
      'appium:app': path.join(process.cwd(), '../build/app/outputs/flutter-apk/app-debug.apk'),
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,
      'appium:appWaitActivity': 'com.wiicare.wiicare_movil.MainActivity',
    }
  ],

  // ===================
  // Test Configurations
  // ===================
  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // =====
  // Hooks
  // =====
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },

  // ========
  // Services
  // ========
  services: [],

  onPrepare: function (config, capabilities) {
    console.log('🚀 Starting Appium tests for WiiCare...');
  },

  onComplete: function(exitCode, config, capabilities, results) {
    console.log('✅ Appium tests completed!');
  }
};
