const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

jest.setTimeout(60000);

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
  } catch (e) {
    // Fallback a Mongo local si no arranca la instancia en memoria
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wiicare_test';
    // eslint-disable-next-line no-console
    console.warn('MongoMemoryServer no arrancó, usando Mongo local:', e.message);
  }
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_1234567890';
  process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  if (mongod) await mongod.stop();
});
