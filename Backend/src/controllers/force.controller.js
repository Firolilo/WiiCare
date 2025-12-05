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

/**
 * Guarda múltiples lecturas en lote
 */
exports.saveBatchReadings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { readings } = req.body;

    if (!readings || !Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere un array de readings' 
      });
    }

    const sessionId = `batch_${Date.now()}`;
    const documents = readings.map(r => ({
      userId,
      adcValue: r.adcValue || r.adc,
      forceNewtons: r.forceNewtons || r.fuerza,
      readingTimestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
      sessionId
    }));

    const savedReadings = await ForceReading.insertMany(documents);

    res.status(201).json({ 
      success: true, 
      count: savedReadings.length,
      sessionId 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Analiza las lecturas de un paciente y determina su estado y tendencia
 * Calcula: estado actual, tendencia (mejorando/empeorando), comparación con períodos anteriores
 */
exports.getPatientAnalysis = async (req, res) => {
  try {
    const userId = req.params.userId;
    const mongoose = require('mongoose');

    // Obtener lecturas de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Obtener todas las lecturas del último mes
    const allReadings = await ForceReading.find({
      userId: new mongoose.Types.ObjectId(userId),
      readingTimestamp: { $gte: thirtyDaysAgo }
    }).sort({ readingTimestamp: 1 }).lean();

    if (allReadings.length === 0) {
      return res.json({
        success: true,
        analysis: {
          hasData: false,
          message: 'No hay datos suficientes para el análisis',
          recommendation: 'El paciente necesita comenzar a usar el sensor de fuerza regularmente.'
        }
      });
    }

    // Dividir en períodos para análisis de tendencia
    const recentReadings = allReadings.filter(r => new Date(r.readingTimestamp) >= sevenDaysAgo);
    const midReadings = allReadings.filter(r => {
      const date = new Date(r.readingTimestamp);
      return date >= fifteenDaysAgo && date < sevenDaysAgo;
    });
    const oldReadings = allReadings.filter(r => {
      const date = new Date(r.readingTimestamp);
      return date >= thirtyDaysAgo && date < fifteenDaysAgo;
    });

    // Calcular promedios por período
    const calcAvg = (readings) => {
      if (readings.length === 0) return null;
      return readings.reduce((sum, r) => sum + r.forceNewtons, 0) / readings.length;
    };

    const calcMax = (readings) => {
      if (readings.length === 0) return null;
      return Math.max(...readings.map(r => r.forceNewtons));
    };

    const recentAvg = calcAvg(recentReadings);
    const midAvg = calcAvg(midReadings);
    const oldAvg = calcAvg(oldReadings);
    
    const recentMax = calcMax(recentReadings);
    const midMax = calcMax(midReadings);
    const oldMax = calcMax(oldReadings);

    const overallAvg = calcAvg(allReadings);
    const overallMax = calcMax(allReadings);

    // Determinar tendencia
    let trend = 'stable';
    let trendDescription = 'Estable';
    let trendPercentage = 0;

    if (recentAvg !== null && (midAvg !== null || oldAvg !== null)) {
      const previousAvg = midAvg !== null ? midAvg : oldAvg;
      trendPercentage = ((recentAvg - previousAvg) / previousAvg) * 100;

      if (trendPercentage > 10) {
        trend = 'improving';
        trendDescription = 'Mejorando';
      } else if (trendPercentage < -10) {
        trend = 'declining';
        trendDescription = 'Empeorando';
      } else {
        trend = 'stable';
        trendDescription = 'Estable';
      }
    }

    // Evaluar estado actual basado en fuerza promedio
    // Estos umbrales pueden ajustarse según criterios médicos
    let status = 'unknown';
    let statusDescription = 'Sin evaluar';
    let statusColor = 'gray';

    if (recentAvg !== null) {
      if (recentAvg >= 20) {
        status = 'excellent';
        statusDescription = 'Excelente';
        statusColor = 'green';
      } else if (recentAvg >= 10) {
        status = 'good';
        statusDescription = 'Bueno';
        statusColor = 'blue';
      } else if (recentAvg >= 5) {
        status = 'fair';
        statusDescription = 'Regular';
        statusColor = 'yellow';
      } else {
        status = 'needs_attention';
        statusDescription = 'Necesita atención';
        statusColor = 'red';
      }
    }

    // Generar recomendación
    let recommendation = '';
    if (trend === 'improving') {
      recommendation = 'El paciente muestra mejoría. Continuar con el régimen actual de ejercicios.';
    } else if (trend === 'declining') {
      recommendation = 'Se detecta disminución en la fuerza. Considerar revisar el plan de tratamiento o verificar que el paciente está realizando los ejercicios correctamente.';
    } else if (status === 'needs_attention') {
      recommendation = 'Los niveles de fuerza son bajos. Se recomienda una evaluación presencial y posible ajuste del tratamiento.';
    } else {
      recommendation = 'El paciente mantiene niveles estables. Continuar con el seguimiento regular.';
    }

    // Calcular consistencia (qué tan regular usa el sensor)
    const daysWithReadings = new Set(
      allReadings.map(r => new Date(r.readingTimestamp).toDateString())
    ).size;
    const consistencyPercentage = Math.round((daysWithReadings / 30) * 100);

    // Estadísticas por día de la semana (para detectar patrones)
    const dayStats = {};
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    allReadings.forEach(r => {
      const day = new Date(r.readingTimestamp).getDay();
      if (!dayStats[day]) {
        dayStats[day] = { count: 0, sum: 0 };
      }
      dayStats[day].count++;
      dayStats[day].sum += r.forceNewtons;
    });

    const dayAverages = Object.entries(dayStats).map(([day, stats]) => ({
      day: dayNames[parseInt(day)],
      average: stats.sum / stats.count,
      count: stats.count
    })).sort((a, b) => b.average - a.average);

    res.json({
      success: true,
      analysis: {
        hasData: true,
        totalReadings: allReadings.length,
        periodDays: 30,
        
        // Estado actual
        currentStatus: {
          status,
          description: statusDescription,
          color: statusColor,
          averageForce: recentAvg ? parseFloat(recentAvg.toFixed(2)) : null,
          maxForce: recentMax ? parseFloat(recentMax.toFixed(2)) : null,
          readingsLast7Days: recentReadings.length
        },

        // Tendencia
        trend: {
          direction: trend,
          description: trendDescription,
          changePercentage: parseFloat(trendPercentage.toFixed(1)),
          comparison: {
            recent: recentAvg ? parseFloat(recentAvg.toFixed(2)) : null,
            previous: midAvg ? parseFloat(midAvg.toFixed(2)) : (oldAvg ? parseFloat(oldAvg.toFixed(2)) : null)
          }
        },

        // Estadísticas generales
        overall: {
          averageForce: parseFloat(overallAvg.toFixed(2)),
          maxForce: parseFloat(overallMax.toFixed(2)),
          consistencyPercentage,
          daysWithReadings
        },

        // Patrones por día
        patterns: {
          bestDays: dayAverages.slice(0, 2),
          worstDays: dayAverages.slice(-2).reverse()
        },

        // Períodos comparativos
        periods: {
          last7Days: {
            average: recentAvg ? parseFloat(recentAvg.toFixed(2)) : null,
            max: recentMax ? parseFloat(recentMax.toFixed(2)) : null,
            readings: recentReadings.length
          },
          days8to15: {
            average: midAvg ? parseFloat(midAvg.toFixed(2)) : null,
            max: midMax ? parseFloat(midMax.toFixed(2)) : null,
            readings: midReadings.length
          },
          days16to30: {
            average: oldAvg ? parseFloat(oldAvg.toFixed(2)) : null,
            max: oldMax ? parseFloat(oldMax.toFixed(2)) : null,
            readings: oldReadings.length
          }
        },

        // Recomendación
        recommendation,

        // Fecha del último registro
        lastReading: allReadings.length > 0 
          ? allReadings[allReadings.length - 1].readingTimestamp 
          : null
      }
    });
  } catch (error) {
    console.error('Error en análisis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
