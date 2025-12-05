const ForceReading = require('../models/ForceReading');
const serialService = require('../services/serialService');

/**
 * Lista los puertos seriales disponibles
 */
exports.listPorts = async (req, res) => {
  try {
    const ports = await serialService.listPorts();
    res.json({ success: true, ports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Conecta al puerto serial del Arduino
 */
exports.connect = async (req, res) => {
  try {
    const { portPath, baudRate = 9600 } = req.body;
    
    if (!portPath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere portPath (ej: COM3 o /dev/ttyUSB0)' 
      });
    }

    const result = await serialService.connect(portPath, baudRate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Desconecta del puerto serial
 */
exports.disconnect = async (req, res) => {
  try {
    const result = await serialService.disconnect();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Obtiene el estado del servicio serial
 */
exports.getStatus = (req, res) => {
  const status = serialService.getStatus();
  res.json({ success: true, ...status });
};

/**
 * Inicia una sesión de medición para el usuario autenticado
 */
exports.startSession = (req, res) => {
  const userId = req.user.id;
  const session = serialService.startSession(userId);
  res.json({ success: true, session });
};

/**
 * Finaliza la sesión de medición actual
 */
exports.stopSession = (req, res) => {
  const session = serialService.stopSession();
  res.json({ success: true, session });
};

/**
 * Obtiene las lecturas de fuerza de un usuario
 */
exports.getReadings = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { startDate, endDate, limit = 100, sessionId } = req.query;

    const query = { userId };

    if (sessionId) {
      query.sessionId = sessionId;
    }

    if (startDate || endDate) {
      query.readingTimestamp = {};
      if (startDate) query.readingTimestamp.$gte = new Date(startDate);
      if (endDate) query.readingTimestamp.$lte = new Date(endDate);
    }

    const readings = await ForceReading.find(query)
      .sort({ readingTimestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, readings, total: readings.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Obtiene estadísticas de fuerza de un usuario
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { startDate, endDate } = req.query;

    const stats = await ForceReading.getStats(
      userId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Agrega una nota a una lectura
 */
exports.addNote = async (req, res) => {
  try {
    const { readingId } = req.params;
    const { notes } = req.body;

    const reading = await ForceReading.findByIdAndUpdate(
      readingId,
      { notes },
      { new: true }
    );

    if (!reading) {
      return res.status(404).json({ success: false, error: 'Lectura no encontrada' });
    }

    res.json({ success: true, reading });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Obtiene las sesiones de medición de un usuario
 */
exports.getSessions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const sessions = await ForceReading.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      {
        $group: {
          _id: '$sessionId',
          startTime: { $min: '$readingTimestamp' },
          endTime: { $max: '$readingTimestamp' },
          readingsCount: { $sum: 1 },
          avgForce: { $avg: '$forceNewtons' },
          maxForce: { $max: '$forceNewtons' }
        }
      },
      { $sort: { startTime: -1 } }
    ]);

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Guarda una lectura manual (para pruebas o entrada manual)
 */
exports.saveManualReading = async (req, res) => {
  try {
    const userId = req.user.id;
    const { adcValue, forceNewtons, notes } = req.body;

    if (adcValue === undefined || forceNewtons === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requieren adcValue y forceNewtons' 
      });
    }

    const reading = new ForceReading({
      userId,
      adcValue,
      forceNewtons,
      notes: notes || '',
      sessionId: `manual_${Date.now()}`
    });

    await reading.save();

    // Emitir vía Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('force-reading-saved', {
        id: reading._id,
        adcValue: reading.adcValue,
        forceNewtons: reading.forceNewtons,
        timestamp: reading.readingTimestamp
      });
    }

    res.status(201).json({ success: true, reading });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
