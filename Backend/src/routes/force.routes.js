const express = require('express');
const forceController = require('../controllers/force.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación
const requireAuth = auth();

// ============ Rutas de Puerto Serial ============

/**
 * @route   GET /api/force/ports
 * @desc    Lista los puertos seriales disponibles
 * @access  Private
 */
router.get('/ports', requireAuth, forceController.listPorts);

/**
 * @route   POST /api/force/connect
 * @desc    Conecta al puerto serial del Arduino
 * @body    { portPath: string, baudRate?: number }
 * @access  Private
 */
router.post('/connect', requireAuth, forceController.connect);

/**
 * @route   POST /api/force/disconnect
 * @desc    Desconecta del puerto serial
 * @access  Private
 */
router.post('/disconnect', requireAuth, forceController.disconnect);

/**
 * @route   GET /api/force/status
 * @desc    Obtiene el estado del servicio serial
 * @access  Private
 */
router.get('/status', requireAuth, forceController.getStatus);

// ============ Rutas de Sesión de Medición ============

/**
 * @route   POST /api/force/session/start
 * @desc    Inicia una sesión de medición para el usuario
 * @access  Private
 */
router.post('/session/start', requireAuth, forceController.startSession);

/**
 * @route   POST /api/force/session/stop
 * @desc    Finaliza la sesión de medición actual
 * @access  Private
 */
router.post('/session/stop', requireAuth, forceController.stopSession);

/**
 * @route   GET /api/force/sessions
 * @desc    Obtiene las sesiones del usuario autenticado
 * @access  Private
 */
router.get('/sessions', requireAuth, forceController.getSessions);

/**
 * @route   GET /api/force/sessions/:userId
 * @desc    Obtiene las sesiones de un usuario específico (para cuidadores)
 * @access  Private
 */
router.get('/sessions/:userId', requireAuth, forceController.getSessions);

// ============ Rutas de Lecturas ============

/**
 * @route   GET /api/force/readings
 * @desc    Obtiene las lecturas del usuario autenticado
 * @query   { startDate?, endDate?, limit?, sessionId? }
 * @access  Private
 */
router.get('/readings', requireAuth, forceController.getReadings);

/**
 * @route   GET /api/force/readings/:userId
 * @desc    Obtiene las lecturas de un usuario específico (para cuidadores)
 * @query   { startDate?, endDate?, limit?, sessionId? }
 * @access  Private
 */
router.get('/readings/:userId', requireAuth, forceController.getReadings);

/**
 * @route   POST /api/force/readings
 * @desc    Guarda una lectura manual
 * @body    { adcValue: number, forceNewtons: number, notes?: string }
 * @access  Private
 */
router.post('/readings', requireAuth, forceController.saveManualReading);

/**
 * @route   POST /api/force/readings/batch
 * @desc    Guarda múltiples lecturas en lote
 * @body    { readings: Array<{ adcValue, forceNewtons, timestamp? }> }
 * @access  Private
 */
router.post('/readings/batch', requireAuth, forceController.saveBatchReadings);

/**
 * @route   PATCH /api/force/readings/:readingId/notes
 * @desc    Agrega o actualiza notas en una lectura
 * @body    { notes: string }
 * @access  Private
 */
router.patch('/readings/:readingId/notes', requireAuth, forceController.addNote);

// ============ Rutas de Análisis ============

/**
 * @route   GET /api/force/analysis/:userId
 * @desc    Obtiene análisis completo de un paciente (tendencia, estado, recomendaciones)
 * @access  Private (para cuidadores)
 */
router.get('/analysis/:userId', requireAuth, forceController.getPatientAnalysis);

// ============ Rutas de Estadísticas ============

/**
 * @route   GET /api/force/stats
 * @desc    Obtiene estadísticas del usuario autenticado
 * @query   { startDate?, endDate? }
 * @access  Private
 */
router.get('/stats', requireAuth, forceController.getStats);

/**
 * @route   GET /api/force/stats/:userId
 * @desc    Obtiene estadísticas de un usuario específico (para cuidadores)
 * @query   { startDate?, endDate? }
 * @access  Private
 */
router.get('/stats/:userId', requireAuth, forceController.getStats);

module.exports = router;
