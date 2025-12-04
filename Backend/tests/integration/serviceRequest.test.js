const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../src/index');
const { connectDB } = require('../../src/config/db');

describe('Service Request endpoints', () => {
  let tokenCaregiver;
  let tokenUser;
  let caregiverId;
  let userId;
  let serviceId;
  let requestId;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wiicare_test';
    await connectDB(uri);
    await mongoose.connection.db.dropDatabase();

    // Registrar cuidador
    const caregiverReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Cuidador Test', email: 'cuidador@test.com', password: 'Passw0rd!', role: 'caregiver' })
      .expect(201);
    tokenCaregiver = caregiverReg.body.token;
    caregiverId = caregiverReg.body.user._id;

    // Registrar usuario/paciente
    const userReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Paciente Test', email: 'paciente@test.com', password: 'Passw0rd!', role: 'user' })
      .expect(201);
    tokenUser = userReg.body.token;
    userId = userReg.body.user._id;

    // Crear servicio
    const serviceRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${tokenCaregiver}`)
      .send({ title: 'Cuidado de adultos mayores', description: 'Servicio profesional', rate: 50, tags: ['adulto mayor'], location: 'Madrid' })
      .expect(201);
    serviceId = serviceRes.body.service._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/service-requests', () => {
    it('should create a service request as a user', async () => {
      const res = await request(app)
        .post('/api/service-requests')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({
          caregiver: caregiverId,
          service: serviceId,
          patientType: 'elderly',
          message: 'Necesito cuidado para mi padre',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(201);

      expect(res.body.serviceRequest).toBeDefined();
      expect(res.body.serviceRequest.status).toBe('pending');
      expect(res.body.serviceRequest.patientType).toBe('elderly');
      requestId = res.body.serviceRequest._id;
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post('/api/service-requests')
        .send({
          caregiver: caregiverId,
          service: serviceId,
          patientType: 'elderly'
        })
        .expect(401);
    });
  });

  describe('GET /api/service-requests/caregiver', () => {
    it('should get requests for caregiver', async () => {
      const res = await request(app)
        .get('/api/service-requests/caregiver')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(Array.isArray(res.body.requests)).toBe(true);
      expect(res.body.requests.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/service-requests/caregiver?status=pending')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(res.body.requests.every(r => r.status === 'pending')).toBe(true);
    });
  });

  describe('GET /api/service-requests/patient', () => {
    it('should get requests for patient', async () => {
      const res = await request(app)
        .get('/api/service-requests/patient')
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(200);

      expect(Array.isArray(res.body.requests)).toBe(true);
      expect(res.body.requests.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/service-requests/:id/accept', () => {
    it('should accept a request and create patient profile', async () => {
      const res = await request(app)
        .patch(`/api/service-requests/${requestId}/accept`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(res.body.serviceRequest.status).toBe('accepted');
      expect(res.body.patientProfile).toBeDefined();
      expect(res.body.patientProfile.patientType).toBe('elderly');
    });

    it('should fail if request already accepted', async () => {
      await request(app)
        .patch(`/api/service-requests/${requestId}/accept`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(404);
    });
  });

  describe('PATCH /api/service-requests/:id/reject', () => {
    let newRequestId;

    beforeAll(async () => {
      // Crear nueva solicitud para rechazar
      const res = await request(app)
        .post('/api/service-requests')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({
          caregiver: caregiverId,
          service: serviceId,
          patientType: 'child',
          message: 'Necesito cuidado para mi hijo'
        })
        .expect(201);
      newRequestId = res.body.serviceRequest._id;
    });

    it('should reject a request with notes', async () => {
      const res = await request(app)
        .patch(`/api/service-requests/${newRequestId}/reject`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({ notes: 'No tengo disponibilidad en este momento' })
        .expect(200);

      expect(res.body.serviceRequest.status).toBe('rejected');
      expect(res.body.serviceRequest.notes).toBe('No tengo disponibilidad en este momento');
    });
  });
});
