const path = require('path');

exports.config = {
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  port: 4723,

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
      // Android capabilities
      platformName: 'Android',
      'appium:deviceName': 'Android Emulator',
      'appium:platformVersion': '13.0', // Cambiar según tu emulador
      'appium:automationName': 'UiAutomator2',
      'appium:app': path.join(process.cwd(), '../build/app/outputs/flutter-apk/app-debug.apk'),
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,
      'appium:appWaitActivity': 'com.wiicare.app.MainActivity',
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
