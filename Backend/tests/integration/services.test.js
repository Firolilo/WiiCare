const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../src/index');
const { connectDB } = require('../../src/config/db');

describe('Services endpoints', () => {
  let tokenCaregiver;
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wiicare_test';
    await connectDB(uri);
    await mongoose.connection.db.dropDatabase();

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Care', email: 'care@example.com', password: 'Passw0rd!', role: 'caregiver' })
      .expect(201);
    tokenCaregiver = reg.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('creates and queries a service', async () => {
    const created = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${tokenCaregiver}`)
      .send({ title: 'Cuidado', description: 'Desc', rate: 10, tags: ['TEA'], location: 'Madrid' })
      .expect(201);
    expect(created.body.service.title).toBe('Cuidado');

    const list = await request(app).get('/api/services?query=Cuidado').expect(200);
    expect(Array.isArray(list.body.services)).toBe(true);
    expect(list.body.services.length).toBeGreaterThan(0);
  });
});
