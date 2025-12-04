const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../src/index');
const { connectDB } = require('../../src/config/db');

describe('Care Template endpoints', () => {
  let tokenCaregiver;
  let templateId;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wiicare_test';
    await connectDB(uri);
    await mongoose.connection.db.dropDatabase();

    // Registrar cuidador
    const caregiverReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Cuidador Template', email: 'template@test.com', password: 'Passw0rd!', role: 'caregiver' })
      .expect(201);
    tokenCaregiver = caregiverReg.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/care-templates', () => {
    it('should create a care template', async () => {
      const res = await request(app)
        .post('/api/care-templates')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          name: 'Plantilla Adulto Mayor Personalizada',
          patientType: 'elderly',
          description: 'Plantilla personalizada para adultos mayores',
          tasks: [
            { name: 'Control de signos vitales', description: 'Medir presión y temperatura', frequency: 'daily', category: 'monitoring' },
            { name: 'Administración de medicamentos', description: 'Dar medicinas según horario', frequency: 'daily', category: 'medication' }
          ],
          recommendations: ['Mantener hidratación', 'Ejercicio suave diario'],
          healthIndicators: [
            { name: 'Presión arterial', unit: 'mmHg', normalRange: '120/80' },
            { name: 'Frecuencia cardíaca', unit: 'bpm', normalRange: '60-100' }
          ]
        })
        .expect(201);

      expect(res.body.template.name).toBe('Plantilla Adulto Mayor Personalizada');
      expect(res.body.template.tasks.length).toBe(2);
      expect(res.body.template.isSystemTemplate).toBe(false);
      templateId = res.body.template._id;
    });
  });

  describe('GET /api/care-templates', () => {
    it('should get all templates', async () => {
      const res = await request(app)
        .get('/api/care-templates')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(Array.isArray(res.body.templates)).toBe(true);
      expect(res.body.templates.length).toBeGreaterThan(0);
    });

    it('should filter by patient type', async () => {
      const res = await request(app)
        .get('/api/care-templates?patientType=elderly')
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(res.body.templates.every(t => t.patientType === 'elderly')).toBe(true);
    });
  });

  describe('GET /api/care-templates/:id', () => {
    it('should get a specific template', async () => {
      const res = await request(app)
        .get(`/api/care-templates/${templateId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      expect(res.body.template._id).toBe(templateId);
      expect(res.body.template.name).toBe('Plantilla Adulto Mayor Personalizada');
    });
  });

  describe('PATCH /api/care-templates/:id', () => {
    it('should update a template', async () => {
      const res = await request(app)
        .patch(`/api/care-templates/${templateId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .send({
          description: 'Plantilla actualizada para adultos mayores con necesidades especiales'
        })
        .expect(200);

      expect(res.body.template.description).toContain('actualizada');
    });
  });

  describe('DELETE /api/care-templates/:id', () => {
    it('should delete a template', async () => {
      await request(app)
        .delete(`/api/care-templates/${templateId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(200);

      // Verificar que ya no existe
      await request(app)
        .get(`/api/care-templates/${templateId}`)
        .set('Authorization', `Bearer ${tokenCaregiver}`)
        .expect(404);
    });
  });
});
