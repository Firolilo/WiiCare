const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const patientViewController = require('../controllers/patientView.controller');

// Dashboard completo del paciente
router.get('/dashboard', auth(), patientViewController.getMyCareDashboard);

// Endpoints específicos
router.get('/daily-care', auth(), patientViewController.getMyDailyCare);
router.get('/medications', auth(), patientViewController.getMyMedications);
router.get('/recommendations', auth(), patientViewController.getMyRecommendations);
router.get('/incidents', auth(), patientViewController.getMyIncidents);
router.get('/appointments', auth(), patientViewController.getMyAppointments);
router.get('/health-indicators', auth(), patientViewController.getMyHealthIndicators);
router.get('/documents', auth(), patientViewController.getMyDocuments);
router.get('/care-plans', auth(), patientViewController.getMyCarePlans);

module.exports = router;
