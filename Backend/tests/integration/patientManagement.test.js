const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../src/index');
const { connectDB } = require('../../src/config/db');

// Import all models to ensure they're registered
require('../../src/models/PatientProfile');
require('../../src/models/DailyCare');
require('../../src/models/Medication');
require('../../src/models/Recommendation');
require('../../src/models/Incident');
require('../../src/models/Appointment');
require('../../src/models/HealthIndicator');
require('../../src/models/CarePlan');

describe('Patient Management endpoints', () => {
  let tokenCaregiver;
  let tokenUser;
  let caregiverId;
  let userId;
  let serviceId;
  let patientProfileId;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wiicare_test';
    await connectDB(uri);
    
    // Limpiar datos de prueba
    const User = mongoose.model('User');
    const PatientProfile = mongoose.model('PatientProfile');
    await User.deleteMany({ email: { $in: ['cuidador.pm@test.com', 'paciente.pm@test.com'] }});
    await PatientProfile.deleteMany({});

    // Registrar cuidador
    const caregiverReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Cuidador PM', email: 'cuidador.pm@test.com', password: 'Passw0rd!', role: 'caregiver' })
      .expect(201);
    tokenCaregiver = caregiverReg.body.token;
    caregiverId = caregiverReg.body.user._id;

    // Registrar usuario/paciente
    const userReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Paciente PM', email: 'paciente.pm@test.com', password: 'Passw0rd!', role: 'user' })
      .expect(201);
    tokenUser = userReg.body.token;
    userId = userReg.body.user._id;

    // Crear servicio
    const serviceRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${tokenCaregiver}`)
      .send({ title: 'Cuidado especializado', description: 'Test', rate: 50, tags: ['test'], location: 'Test' })
      .expect(201);
    serviceId = serviceRes.body.service._id;

    // Crear solicitud y aceptarla
    const requestRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ caregiver: caregiverId, service: serviceId, patientType: 'elderly', message: 'Test' })
      .expect(201);

    const acceptRes = await request(app)
      .patch(`/api/service-requests/${requestRes.body.serviceRequest._id}/accept`)
      .set('Authorization', `Bearer ${tokenCaregiver}`)
      .expect(200);

    patientProfileId = acceptRes.body.patientProfile._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Patient Profiles', () => {
    it('GET /profiles - should get caregiver patients', async () => {
      const res = await request(app)
        .get('/api/patient-management/profiles')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(Array.isArray(res.body.patients)).toBe(true);
      expect(res.body.patients.length).toBeGreaterThan(0);
    });

    it('GET /profiles/:id - should get patient profile', async () => {
      const res = await request(app)
        .get(`/api/patient-management/profiles/${patientProfileId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(res.body.profile).toBeDefined();
      expect(res.body.profile.patientType).toBe('elderly');
    });

    it('PATCH /profiles/:id - should update patient profile', async () => {
      const res = await request(app)
        .patch(`/api/patient-management/profiles/${patientProfileId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({ age: 75, gender: 'masculino', allergies: ['penicilina', 'mariscos'] })
        .expect(200);

      expect(res.body.profile.age).toBe(75);
      expect(res.body.profile.allergies).toContain('penicilina');
    });
  });

  describe('Daily Care', () => {
    let dailyCareId;

    it('POST /daily-care - should create daily care task', async () => {
      const res = await request(app)
        .post('/api/patient-management/daily-care')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          patientProfile: patientProfileId,
          task: 'Baño matutino',
          description: 'Asistir con el baño',
          category: 'hygiene',
          date: new Date().toISOString(),
          scheduledTime: '08:00'
        })
        .expect(201);

      expect(res.body.dailyCare.task).toBe('Baño matutino');
      expect(res.body.dailyCare.completed).toBe(false);
      dailyCareId = res.body.dailyCare._id;
    });

    it('GET /daily-care - should get daily care tasks', async () => {
      const res = await request(app)
        .get(`/api/patient-management/daily-care?patientProfile=${patientProfileId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(Array.isArray(res.body.dailyCare)).toBe(true);
      expect(res.body.dailyCare.length).toBeGreaterThan(0);
    });

    it('PATCH /daily-care/:id/complete - should mark task as completed', async () => {
      const res = await request(app)
        .patch(`/api/patient-management/daily-care/${dailyCareId}/complete`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({ notes: 'Completado sin problemas' })
        .expect(200);

      expect(res.body.dailyCare.completed).toBe(true);
      expect(res.body.dailyCare.notes).toBe('Completado sin problemas');
    });
  });

  describe('Medications', () => {
    let medicationId;

    it('POST /medications - should create medication', async () => {
      const res = await request(app)
        .post('/api/patient-management/medications')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          patientProfile: patientProfileId,
          name: 'Metformina',
          dose: '500mg',
          frequency: 'twice-daily',
          instructions: 'Tomar con alimentos',
          startDate: new Date().toISOString()
        })
        .expect(201);

      expect(res.body.medication.name).toBe('Metformina');
      medicationId = res.body.medication._id;
    });

    it('GET /medications - should get medications', async () => {
      const res = await request(app)
        .get(`/api/patient-management/medications?patientProfile=${patientProfileId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(Array.isArray(res.body.medications)).toBe(true);
      expect(res.body.medications.length).toBeGreaterThan(0);
    });

    it('PATCH /medications/:id - should update medication', async () => {
      const res = await request(app)
        .patch(`/api/patient-management/medications/${medicationId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({ dose: '850mg' })
        .expect(200);

      expect(res.body.medication.dose).toBe('850mg');
    });
  });

  describe('Recommendations', () => {
    it('POST /recommendations - should create recommendation', async () => {
      const res = await request(app)
        .post('/api/patient-management/recommendations')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          patientProfile: patientProfileId,
          title: 'Ejercicio diario',
          content: 'Caminar 30 minutos al día',
          category: 'exercise',
          priority: 'high'
        })
        .expect(201);

      expect(res.body.recommendation.title).toBe('Ejercicio diario');
    });

    it('GET /recommendations - should get recommendations', async () => {
      const res = await request(app)
        .get(`/api/patient-management/recommendations?patientProfile=${patientProfileId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(Array.isArray(res.body.recommendations)).toBe(true);
    });
  });

  describe('Incidents', () => {
    let incidentId;

    it('POST /incidents - should create incident', async () => {
      const res = await request(app)
        .post('/api/patient-management/incidents')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          patientProfile: patientProfileId,
          title: 'Caída leve',
          description: 'El paciente se resbaló en el baño',
          type: 'fall',
          severity: 'medium',
          occurredAt: new Date().toISOString()
        })
        .expect(201);

      expect(res.body.incident.title).toBe('Caída leve');
      expect(res.body.incident.resolved).toBe(false);
      incidentId = res.body.incident._id;
    });

    it('PATCH /incidents/:id/resolve - should resolve incident', async () => {
      const res = await request(app)
        .patch(`/api/patient-management/incidents/${incidentId}/resolve`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          resolutionNotes: 'Se aplicaron primeros auxilios y se notificó a la familia'
        })
        .expect(200);

      expect(res.body.incident.resolved).toBe(true);
    });
  });

  describe('Appointments', () => {
    it('POST /appointments - should create appointment', async () => {
      const res = await request(app)
        .post('/api/patient-management/appointments')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          patientProfile: patientProfileId,
          title: 'Consulta médica',
          description: 'Control mensual',
          startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
          location: 'Hospital General'
        })
        .expect(201);

      expect(res.body.appointment.title).toBe('Consulta médica');
    });

    it('GET /appointments - should get appointments', async () => {
      const res = await request(app)
        .get(`/api/patient-management/appointments?patientProfile=${patientProfileId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(Array.isArray(res.body.appointments)).toBe(true);
    });
  });

  describe('Health Indicators', () => {
    it('POST /health-indicators - should create health indicator', async () => {
      const res = await request(app)
        .post('/api/patient-management/health-indicators')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          patientProfile: patientProfileId,
          type: 'blood-pressure',
          value: '120/80',
          unit: 'mmHg',
          measuredAt: new Date().toISOString()
        })
        .expect(201);

      expect(res.body.healthIndicator.type).toBe('blood-pressure');
    });

    it('GET /health-indicators - should get health indicators', async () => {
      const res = await request(app)
        .get(`/api/patient-management/health-indicators?patientProfile=${patientProfileId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(Array.isArray(res.body.healthIndicators)).toBe(true);
    });
  });

  describe('Care Plans', () => {
    let carePlanId;
    let goalId;

    it('POST /care-plans - should create care plan', async () => {
      const res = await request(app)
        .post('/api/patient-management/care-plans')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          patientProfile: patientProfileId,
          title: 'Plan de recuperación',
          description: 'Plan mensual de cuidados',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          period: 'monthly',
          goals: [
            { description: 'Mejorar movilidad' },
            { description: 'Control de peso' }
          ]
        })
        .expect(201);

      expect(res.body.carePlan.title).toBe('Plan de recuperación');
      expect(res.body.carePlan.goals.length).toBe(2);
      carePlanId = res.body.carePlan._id;
      goalId = res.body.carePlan.goals[0]._id;
    });

    it('PATCH /care-plans/:planId/goals/:goalId/achieve - should achieve goal', async () => {
      const res = await request(app)
        .patch(`/api/patient-management/care-plans/${carePlanId}/goals/${goalId}/achieve`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      const goal = res.body.carePlan.goals.find(g => g._id === goalId);
      expect(goal.achieved).toBe(true);
    });
  });
});
