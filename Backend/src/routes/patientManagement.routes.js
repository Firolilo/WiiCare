const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const patientManagementController = require('../controllers/patientManagement.controller');

// ===== PATIENT PROFILES =====
router.get('/profiles', auth(), patientManagementController.getCaregiverPatients);
router.get('/profiles/:id', auth(), patientManagementController.getPatientProfile);
router.patch('/profiles/:id', auth(), patientManagementController.updatePatientProfile);

// ===== DAILY CARE =====
router.post('/daily-care', auth(), patientManagementController.createDailyCare);
router.get('/daily-care', auth(), patientManagementController.getDailyCare);
router.patch('/daily-care/:id', auth(), patientManagementController.updateDailyCare);
router.patch('/daily-care/:id/complete', auth(), patientManagementController.completeDailyCare);
router.delete('/daily-care/:id', auth(), patientManagementController.deleteDailyCare);

// ===== MEDICATIONS =====
router.post('/medications', auth(), patientManagementController.createMedication);
router.get('/medications', auth(), patientManagementController.getMedications);
router.patch('/medications/:id', auth(), patientManagementController.updateMedication);
router.delete('/medications/:id', auth(), patientManagementController.deleteMedication);

// ===== RECOMMENDATIONS =====
router.post('/recommendations', auth(), patientManagementController.createRecommendation);
router.get('/recommendations', auth(), patientManagementController.getRecommendations);
router.patch('/recommendations/:id', auth(), patientManagementController.updateRecommendation);
router.delete('/recommendations/:id', auth(), patientManagementController.deleteRecommendation);

// ===== INCIDENTS =====
router.post('/incidents', auth(), patientManagementController.createIncident);
router.get('/incidents', auth(), patientManagementController.getIncidents);
router.patch('/incidents/:id', auth(), patientManagementController.updateIncident);
router.patch('/incidents/:id/resolve', auth(), patientManagementController.resolveIncident);

// ===== APPOINTMENTS =====
router.post('/appointments', auth(), patientManagementController.createAppointment);
router.get('/appointments', auth(), patientManagementController.getAppointments);
router.patch('/appointments/:id', auth(), patientManagementController.updateAppointment);
router.delete('/appointments/:id', auth(), patientManagementController.deleteAppointment);

// ===== HEALTH INDICATORS =====
router.post('/health-indicators', auth(), patientManagementController.createHealthIndicator);
router.get('/health-indicators', auth(), patientManagementController.getHealthIndicators);
router.patch('/health-indicators/:id', auth(), patientManagementController.updateHealthIndicator);

// ===== CARE PLANS =====
router.post('/care-plans', auth(), patientManagementController.createCarePlan);
router.get('/care-plans', auth(), patientManagementController.getCarePlans);
router.patch('/care-plans/:id', auth(), patientManagementController.updateCarePlan);
router.patch('/care-plans/:planId/goals/:goalId/achieve', auth(), patientManagementController.achieveGoal);

module.exports = router;
