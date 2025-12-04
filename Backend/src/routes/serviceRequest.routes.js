const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const serviceRequestController = require('../controllers/serviceRequest.controller');

// Crear solicitud (paciente)
router.post('/', auth(), serviceRequestController.createServiceRequest);

// Listar solicitudes del cuidador
router.get('/caregiver', auth(), serviceRequestController.getCaregiverRequests);

// Listar solicitudes del paciente
router.get('/patient', auth(), serviceRequestController.getPatientRequests);

// Aceptar solicitud (cuidador)
router.patch('/:id/accept', auth(), serviceRequestController.acceptRequest);

// Rechazar solicitud (cuidador)
router.patch('/:id/reject', auth(), serviceRequestController.rejectRequest);

module.exports = router;
