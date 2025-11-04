const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../src/index');
const { connectDB } = require('../../src/config/db');

describe('Auth endpoints', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wiicare_test';
    await connectDB(uri);
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('registers and logs in a user', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'Passw0rd!', role: 'user' })
      .expect(201);

    expect(reg.body.token).toBeDefined();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Passw0rd!' })
      .expect(200);
    expect(login.body.token).toBeDefined();
  });
});
